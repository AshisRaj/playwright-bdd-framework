import getConfig from '@configs';
import { defineConfig, devices } from '@playwright/test';
import { getEnv, PROJECT_ROOT, reportMetaData } from '@utils';
import path from 'path';

import { defineBddConfig } from 'playwright-bdd';

const env = getEnv();

// reads src/configs/<env>.ts when present). Default: dev.ts
// also supports loading .env files (e.g. .env.qa for 'qa' env)
// and merges with config.ts values
const cfg = getConfig(env);

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

const metaData = reportMetaData();

/**
 * Inline reporter selection (generator-controlled)
 * - monocart: adds onEnd email hook and trend file
 * - allure:   basic allure-playwright reporter
 * - html:     built-in HTML
 * - list:     simple console reporter
 */

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
  retries: process.env.CI ? 0 : (cfg.retries ?? 0),
  workers: process.env.CI ? 1 : (cfg.workers ?? 1), // Use a single worker in CI to avoid potential issues with parallel execution

  // Provide top-level metadata for Playwright
  metadata: metaData,

  // Reporters
  reporter: cfg.reporter,

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
      metadata: metaData,
    })),
  ],
  webServer: {
    command: 'npm start',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
