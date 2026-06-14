/* eslint-disable @typescript-eslint/no-explicit-any */
import getConfig from '@configs';
import { defineConfig, devices, ReporterDescription } from '@playwright/test';
import { getEnv, PROJECT_ROOT, runId } from '@utils';
import path from 'path';

import fs from 'fs';

import { cucumberReporter, defineBddConfig } from 'playwright-bdd';

const env = getEnv();

// reads src/configs/<env>.ts when present). Default: dev.ts
// also supports loading .env files (e.g. .env.qa for 'qa' env)
// and merges with config.ts values
const cfg = getConfig(env);

/**
 * Minimal shared metadata for reporters
 * Used by both the custom reporter and the default HTML reporter
 */
const reportMetaData = {
  project: process.env.PROJECT_NAME || 'Playwright BDD Framework',
  language: 'ts',
  env: process.env.ENV || 'dev',
};

// Playwright BDD Test configuration
const testDir = defineBddConfig({
  features: path.join(PROJECT_ROOT, 'features', '**', '*.feature'),
  steps: path.join(PROJECT_ROOT, 'features', 'steps', '**', '*.ts'),
  importTestFrom: path.join(PROJECT_ROOT, 'src', 'fixtures', 'ExtendedFixtures.ts'),
  disableWarnings: { importTestFrom: true },
  outputDir: path.join(PROJECT_ROOT, 'artifacts', '.features-gen'),
  matchKeywords: true, // Match step keywords (Given/When/Then) in a case-insensitive manner
  missingSteps: 'fail-on-gen', // Fail if any steps are missing
  quotes: 'single', // Use single quotes for generated step definitions
});

/**
 * Inline reporter selection (generator-controlled)
 * - monocart: adds onEnd email hook and trend file
 * - allure:   basic allure-playwright reporter
 * - html:     built-in HTML
 * - list:     simple console reporter
 */

// Define the MonocartSummary interface
interface MonocartSummary {
  name: string;
  dateH: string;
  durationH: string;
  cwd: string;
  outputFile: string;
  outputDir: string;
  system: {
    arch: string;
    platform: string;
    release: string;
    type: string;
    version: string;
    hostname: string;
    node: string;
    playwright: string;
    testDir: string;
    outputFile: string;
    outputDir: string;
  };
  htmlPath: string;
  jsonPath: string;
  summaryTable: any;
}

const reporter: ReporterDescription[] = [
  [
    // Custom HTML Reporter with enhanced features like screenshots, videos, and metadata display
    require.resolve('./src/utils/CustomTTAReporter.ts'),
    {
      outputFile: path.join(
        PROJECT_ROOT,
        'artifacts',
        'reports',
        'tta-report',
        `report_${runId()}.html`,
      ),
    },
  ],
  // Cucumber JSON Reporter for integration with tools like Allure or custom dashboards
  cucumberReporter('html', {
    outputFile: path.join(PROJECT_ROOT, 'artifacts', 'reports', 'cucumber-report', 'report.json'),
    externalAttachments: true,
  }),
  [
    // Default Playwright HTML Reporter for a comprehensive overview of test results with screenshots and videos
    'html',
    {
      open: 'never',
      title: process.env.PROJECT_NAME || 'Playwright BDD Framework',
      outputFolder: path.join(PROJECT_ROOT, 'artifacts', 'reports', 'html-reports'),
    },
  ],
  [
    'allure-playwright',
    {
      // tweak as needed
      detail: true,
      resultsDir: path.join(PROJECT_ROOT, 'artifacts', 'reports', 'allure-results'),
      suiteTitle: true,
      open: 'never',
      environmentInfo: {
        ...reportMetaData,
      },
    },
  ],
  [
    'monocart-reporter',
    {
      name: process.env.PROJECT_NAME || 'Playwright E2E Framework',
      outputFile: path.join(PROJECT_ROOT, 'artifacts', 'reports', 'monocart-report', 'index.html'),
      tags: {
        smoke: {
          style: {
            background: '#6F9913',
          },
          description: 'This is Smoke Test',
        },
        regression: {
          style: {
            background: '#c00',
          },
          description: 'This is Regression Test',
        },
      },
      copyAttachments: false,
      clean: true,
      trend: path.join(PROJECT_ROOT, 'artifacts', 'reports', 'monocart-report', 'index.json'),
      // async hook after report data generated
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onEnd: async (reportData: any, helper: any) => {
        const monocartReportSummary: MonocartSummary = {
          name: reportData.name,
          dateH: reportData.dateH,
          durationH: reportData.durationH,
          cwd: reportData.cwd,
          outputFile: reportData.outputFile,
          outputDir: reportData.outputDir,
          system: {
            arch: reportData.system.arch,
            platform: reportData.system.platform,
            release: reportData.system.release,
            type: reportData.system.type,
            version: reportData.system.version,
            hostname: reportData.system.hostname,
            node: reportData.system.node,
            playwright: reportData.system.playwright,
            testDir: reportData.system.testDir,
            outputFile: reportData.system.outputFile,
            outputDir: reportData.system.outputDir,
          },
          htmlPath: reportData.htmlPath,
          jsonPath: reportData.jsonPath,
          summaryTable: reportData.summaryTable,
        };

        const globalReportPath = path.join(
          PROJECT_ROOT,
          'artifacts',
          'reports',
          'monocart-report',
          'monocart-report-data.json',
        );

        // save reportData => global JSON
        fs.writeFileSync(globalReportPath, JSON.stringify(monocartReportSummary, null, 2));
      },
      // example categories (edit to suit your project)
      categories: [
        {
          name: 'UI Tests',
          condition: (info: any) => /[\\/]tests[\\/].*ui/i.test(info.file || ''),
        },
        {
          name: 'API Tests',
          condition: (info: any) => /[\\/]tests[\\/].*api/i.test(info.file || ''),
        },
      ],
      theme: 'dark',
      // ✅ Add this charts config block
      charts: {
        categories: {
          type: 'donut',
          tooltip: {
            show: true,
            formatter: (params: any) => {
              // 'params' contains details about the segment hovered
              return `
              <b>${params.name}</b><br/>
              Count: ${params.value}<br/>
              Percentage: ${params.percent}%
            `;
            },
          },
        },
      },
      timestamp: true,
      // zip: { outputFile: path.join(PROJECT_ROOT, "artifacts", "reports", "monocart-report", "monocart-report.zip"), clean: true }
    },
  ],
];

export default defineConfig({
  testDir,
  // -------------------------------
  // GLOBAL TEST TIMEOUTS
  // -------------------------------
  // CI (Stable App) timeout: 60_000,
  // CI (Flaky App / Slow Environments) timeout: 120_000,
  // Local Development
  timeout: cfg.timeout, // default: 30s per test

  // CI (Stable App) expect: { timeout: 7_000 },
  // CI (Flaky App / Slow Environments) expect: { timeout: 10_000 },
  // Local Development
  expect: {
    timeout: cfg.expectTimeout, // default: 5s for expect() checks
  },
  // Global hooks
  // Global Setup to run before all tests
  globalSetup: path.join(PROJECT_ROOT, 'src', 'utils', 'global-setup.ts'),
  // Global Teardown to run after all tests
  globalTeardown: path.join(PROJECT_ROOT, 'src', 'utils', 'global-teardown.ts'),

  fullyParallel: cfg.fullyParallel,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : (cfg.retries ?? 0),
  workers: process.env.CI ? 1 : cfg.workers, // Use a single worker in CI to avoid potential issues with parallel execution

  // Provide top-level metadata for Playwright
  metadata: reportMetaData,

  // Reporters (selected above)
  reporter,

  // Shared options
  use: {
    baseURL: cfg.baseURL,
    trace: cfg.use?.trace || 'on',
    video: cfg.use?.video || 'off',
    screenshot: cfg.use?.screenshot || 'only-on-failure',
  },

  // Where Playwright writes its artifacts for each test
  // Use a dedicated subfolder to avoid clashes with reporter output folders
  outputDir: path.join(PROJECT_ROOT, 'artifacts', 'reports', 'playwright-results'),

  // Browsers
  projects: [
    ...cfg.projects.map((p) => ({
      name: p.name,
      use: {
        globalConfig: cfg,
        ...(p.device ? devices[p.device as keyof typeof devices] : devices['Desktop Chrome']),
        // -------------------------------
        // ACTION TIMEOUTS
        // -------------------------------
        // CI (Stable App) actionTimeout: 15_000,
        // CI (Flaky App / Slow Environments) actionTimeout: 20_000,
        // Local Development
        actionTimeout: p.actionTimeout ?? cfg.actionTimeout ?? 0,
        navigationTimeout: p.navigationTimeout ?? cfg.navigationTimeout ?? 0,
      },
      metadata: reportMetaData,
    })),
  ],
});
