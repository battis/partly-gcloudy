import * as Plugin from '@battis/qui-cli.plugin';
import { init as coreInit } from './core.js';

export * as app from './app.js';
export * as batch from './batch.js';
export * as billing from './billing.js';
export { args, ready } from './core.js';
export * as iam from './iam.js';
export * as iap from './iap.js';
export * as projects from './projects.js';
export * as scheduler from './scheduler.js';
export * as secrets from './secrets.js';
export * as services from './services.js';
export * as sql from './sql.js';

export const name = 'glcoud';
export const src = import.meta.dirname;

export function options(): Plugin.Options {
  return {
    flag: {
      verbose: {
        short: 'v',
        description: 'Show verbose output (commands and results)'
      }
    },
    opt: {
      project: {
        short: 'p',
        description: 'Google Cloud project ID'
      },
      projectEnvVar: {
        description: 'Environment variable that stores Google Cloud project ID',
        default: 'PROJECT'
      }
    }
  };
}

export function init({
  values: { verbose, project, projectEnvVar }
}: Plugin.Arguments<ReturnType<typeof options>>) {
  coreInit({
    values: {
      verbose: !!verbose,
      project: project?.toString(),
      projectEnvVar: projectEnvVar!.toString()
    }
  });
}
