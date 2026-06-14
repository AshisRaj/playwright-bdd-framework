import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT } from './paths';

import dotenv from 'dotenv';

// Utility function to generate a unique run ID based on the current timestamp
export const runId = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
};

export function loadDotenvIfPresent(env: string) {
  try {
    const envFile = path.join(PROJECT_ROOT, 'src', 'environments', `.env.${env}`);
    if (fs.existsSync(envFile)) {
      dotenv.config({ path: envFile });
      return envFile;
    }
  } catch (e) {
    // swallow it
  }
  return undefined;
}

export type EnvKey = 'dev' | 'qa' | 'staging';

export function getEnv(env?: string) {
  const rawEnv = (env || process.env.PLAYWRIGHT_ENV || process.env.ENV || 'dev').toLowerCase();
  const key = (['dev', 'qa', 'staging'].includes(rawEnv) ? rawEnv : 'dev') as EnvKey;
  return key;
}
