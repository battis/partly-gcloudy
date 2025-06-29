import * as Plugin from '@battis/qui-cli.plugin';
import { Colors } from '@battis/qui-cli.colors';
import { ExpectedArguments } from '@battis/qui-cli.plugin';
import { Shell } from '@battis/qui-cli.shell';
import * as plugin from './gcloud.js';
import * as projects from './projects/index.js';

export * as app from './app/index.js';
export * as batch from './batch/index.js';
export * as billing from './billing/index.js';
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

export const name = 'gcloud';

let verbose = false;
let project: string | undefined = undefined;
let projectEnvVar = 'PROJECT';
let cachedArgs: ExpectedArguments<typeof plugin.options>;
let cachedReady: true | string;

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

export async function init(args: ExpectedArguments<typeof plugin.options>) {
  cachedArgs = args;

  Shell.configure({
    showCommands: !!cachedArgs.values.verbose,
    silent: !cachedArgs.values.verbose
  });

  if (
    ready() &&
    (cachedArgs.values.project ||
      (cachedArgs.values.projectEnvVar &&
        process.env[cachedArgs.values.projectEnvVar]))
  ) {
    const cachedProject = await projects.describe({
      projectId:
        cachedArgs.values.project ||
        (cachedArgs.values.projectEnvVar &&
          process.env[cachedArgs.values.projectEnvVar])
    });
    if (cachedProject) {
      projects.active.activate(cachedProject);
    } else {
      if (cachedArgs.values.project) {
        throw new Error(
          `Project ID argument ${cachedArgs.values.project} unknown`
        );
      } else if (
        cachedArgs.values.projectEnvVar &&
        process.env[cachedArgs.values.projectEnvVar]
      ) {
        throw new Error(
          `Project ID in .env ${cachedArgs.values.projectEnvVar} = ${
            process.env[cachedArgs.values.projectEnvVar]
          } unknown`
        );
      } else {
        throw new Error('Project ID unknown in unexpected manner');
      }
    }
  }
}

export function ready({ fail = true }: { fail?: boolean } = {}) {
  if (cachedReady === undefined) {
    cachedReady =
      /\d+\.\d/.test(Shell.exec('gcloud --version').stdout) ||
      `gcloud is required. Install from ${Colors.url(
        'https://cloud.google.com/sdk/docs/install'
      )}`;
  }
  if (cachedReady !== true) {
    // TODO just install and authorize gcloud interactively
    if (fail) {
      throw new Error(cachedReady);
    } else {
      throw new Error(`${cachedReady} (ready did not expect to fail)`);
    }
  }
  return cachedReady;
}

export function args() {
  return cachedArgs;
}

