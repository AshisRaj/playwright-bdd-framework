/* eslint-disable @typescript-eslint/no-explicit-any */
import { getEnv, loadDotenvIfPresent, logger, PROJECT_ROOT } from '@utils';
import { execSync } from 'child_process';
import { Command } from 'commander';

import { join } from 'path';

const envKey = getEnv();
loadDotenvIfPresent(envKey);

const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

// Graceful cancel on Ctrl+C / kill
process.on('SIGINT', () => {
  logger.info('\n  Aborted by user.');
  process.exit(0);
});
process.on('SIGTERM', () => {
  logger.info('\n⏹  Terminated.');
  process.exit(0);
});

const program = new Command()
  .name('pw-runner')
  .description('Custom Playwright test runner with report open')
  .option('--env <name>', 'Override Environment switch (qa|uat|stage|dev)', 'dev')
  .option(
    '--reporter <name>',
    'Override reporter (monocart|allure|html)',
    process.env.DEFAULT_REPORTER ?? 'monocart',
  )
  .option('--project <name>', 'Run a specific project (e.g., chromium)', 'chromium')
  .option('--grep <re>', 'Grep by RegExp', '')
  .option('--ui', 'Run Playwright UI mode', false)
  .option('--headed', 'Headed mode', false)
  .option('--workers <n>', 'Number of workers', '1')
  .option('--config <path>', 'Custom config path', join(PROJECT_ROOT, 'playwright.config.ts'))
  .option('--trace <mode>', 'Trace mode (on|off|retain-on-failure|on-first-retry)', 'off')
  .allowUnknownOption(true);

program.parse(process.argv);
const opts = program.opts();

const pwArgs = [`cross-env ENV=${opts.env}`, 'playwright', 'test', '--config', opts.config];
if (opts.project) pwArgs.push('--project', opts.project);
if (opts.grep) pwArgs.push('--grep', opts.grep);
if (opts.ui) pwArgs.push('--ui');
if (opts.headed) pwArgs.push('--headed');
if (opts.workers) pwArgs.push('--workers', String(opts.workers));
if (opts.trace) pwArgs.push('--trace', opts.trace);

// Utility to run shell commands synchronously with nice logs
function run(command: string, env: Record<string, string> = {}) {
  try {
    logger.info(`💻 Running: ${command}`);
    execSync(command, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      env: { ...process.env, ...env },
    });
  } catch (err: any) {
    // Normalize common Ctrl+C signatures across OSes
    const isCtrlC =
      err?.signal === 'SIGINT' ||
      err?.status === 130 || // POSIX: 128 + SIGINT(2)
      err?.status === 2 || // Some shells map SIGINT -> 2
      err?.status === 3221225786; // Windows: 0xC000013A

    if (isCtrlC) {
      logger.info('\n^C  Aborted by user.');
      process.exit(0);
    }

    logger.error(`❌ Command failed: ${command}`);
    // Preserve failing exit for real errors, but don't throw noisy stack
    process.exitCode = typeof err?.status === 'number' ? err.status : 1;
  }
}

// --- 1️⃣ Run Playwright tests ---
const cmd = `${NPX} ${pwArgs.join(' ')}`;
run(cmd);

const openMonocartReport = () => {
  logger.info(`📊 Opening Monocart report...`);
  run(`npm run report:open:monocart`);
};

const openAllureReport = () => {
  logger.info(`📊 Opening Allure report...`);
  run(`npm run report:open:allure`);
};

const openHtmlReport = () => {
  logger.info(`📊 Opening Playwright HTML report...`);
  run(`npm run report:open:html`);
};

// --- 2️⃣ Open report based on reporter ---

logger.info(`Default Reporter: ${process.env}`);

const reporter = String(
  opts.reporter || (process.env.DEFAULT_REPORTER ?? 'monocart'),
).toLowerCase();
switch (reporter) {
  case 'monocart':
    openMonocartReport();
    break;
  case 'allure':
    openAllureReport();
    break;
  case 'html':
    openHtmlReport();
    break;
  default:
    logger.warn(`Unknown reporter: ${reporter}. TTA Report will be opened.`);
    run(`npm run report:open:tta`);
    break;
}
