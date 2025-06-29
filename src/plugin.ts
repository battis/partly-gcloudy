import * as Plugin from '@battis/qui-cli.plugin';

export * as app from './app/index.js';
export * as batch from './batch/index.js';
export * as billing from './billing/index.js';
export { args, ready } from './core.js';
export * as iam from './iam/index.js';
export * as iap from './iap/index.js';
export * as projects from './projects/index.js';
export * as scheduler from './scheduler/index.js';
export * as secrets from './secrets/index.js';
export * as services from './services/index.js';
export * as sql from './sql/index.js';

export type Configuration = Plugin.Configuration & {
  verbose?: boolean;
  project?: string;
  projectEnvVar?: string;
};

export const name = 'partly-gcloudy';

let verbose = false;
let project: string | undefined = undefined;
let projectEnvVar = 'PROJECT';

export function configure(config: Configuration = {}) {
  verbose = Plugin.hydrate(config.verbose, verbose);
  project = Plugin.hydrate(config.project, project);
  projectEnvVar = Plugin.hydrate(config.projectEnvVar, projectEnvVar);
}

export function options(): Plugin.Options {
  return {
    flag: {
      verbose: {
        short: 'v',
        description: 'Show verbose output (commands and results)',
        default: verbose
      }
    },
    opt: {
      project: {
        short: 'p',
        description: 'Google Cloud project ID'
      },
      projectEnvVar: {
        description: 'Environment variable that stores Google Cloud project ID',
        default: projectEnvVar
      }
    }
  };
}
