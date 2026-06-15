/* eslint-disable @typescript-eslint/no-explicit-any */
import { PROJECT_ROOT, reportMetaData, runId } from '@utils';
import fs from 'fs';
import path from 'path';
import { cucumberReporter } from 'playwright-bdd';
import { FrameworkConfig, MonocartSummary } from './types';

const metaData = reportMetaData();

const defaultConfig: FrameworkConfig = {
  envName: 'dev',
  baseURL: 'https://www.saucedemo.com/',
  APP_BASE_URL: 'https://www.saucedemo.com/',
  API_BASE_URL: 'http://localhost:3000',
  timeout: 90000,
  expectTimeout: 10000,
  reporter: [
    [
      // Custom HTML Reporter with enhanced features like screenshots, videos, and metadata display
      path.join(PROJECT_ROOT, 'src', 'utils', 'customTTAReporter.ts'),
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
    [
      'allure-playwright',
      {
        // tweak as needed
        detail: true,
        resultsDir: path.join(PROJECT_ROOT, 'artifacts', 'reports', 'allure-results'),
        suiteTitle: true,
        open: 'never',
        environmentInfo: {
          ...metaData,
        },
      },
    ],
    // Default Playwright HTML Reporter for a comprehensive overview of test results with screenshots and videos
    [
      'html',
      {
        open: 'never',
        title: process.env.PROJECT_NAME || 'Playwright BDD Framework',
        outputFolder: path.join(PROJECT_ROOT, 'artifacts', 'reports', 'html-reports'),
      },
    ],

    // Cucumber JSON Reporter for integration with tools like Allure or custom dashboards
    cucumberReporter('html', {
      outputFile: path.join(PROJECT_ROOT, 'artifacts', 'reports', 'cucumber-report', 'report.json'),
      externalAttachments: true,
    }),
    [
      'monocart-reporter',
      {
        name: process.env.PROJECT_NAME || 'Playwright E2E Framework',
        outputFile: path.join(
          PROJECT_ROOT,
          'artifacts',
          'reports',
          'monocart-report',
          'index.html',
        ),
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
  ],
  reportDir: path.join(PROJECT_ROOT, 'artifacts', 'reports'),
  projects: [
    {
      name: 'chromium',
      device: 'Desktop Chrome',
      actionTimeout: 0,
      navigationTimeout: 0,
    },
  ],
  actionTimeout: 0,
  navigationTimeout: 0,
  // Default Playwright runner options
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  workers: undefined,
  use: {
    trace: 'on',
    video: 'on',
    screenshot: 'only-on-failure',
  },
};

export default defaultConfig;
