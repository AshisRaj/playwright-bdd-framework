import { loadDotenvIfPresent } from '@utils';
import defaultConfig from './default';
import localConfig from './dev';
import qaConfig from './qa';
import stagingConfig from './staging';
import { FrameworkConfig } from './types';

export function getConfig(env: string): FrameworkConfig {
  // load corresponding .env file if present (e.g. .env.qa for 'qa' env)
  const dotenvFile = loadDotenvIfPresent(env);

  const partials: Partial<FrameworkConfig> =
    env === 'qa' ? qaConfig : env === 'staging' ? stagingConfig : localConfig;

  const merged: FrameworkConfig = {
    ...defaultConfig,
    ...partials,
    envName: env,
    dotenvFile,
  } as FrameworkConfig;

  return merged;
}

export default getConfig;

export * from './types';
