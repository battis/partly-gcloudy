import { Colors } from '@qui-cli/colors';
import { Core } from '@qui-cli/core';
import { Env } from '@qui-cli/env';
import * as Plugin from '@qui-cli/plugin';
import { ExpectedArguments } from '@qui-cli/plugin';
import { Shell } from '@qui-cli/shell';
import * as plugin from './core.js';
import * as projects from './projects/index.js';

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
  let projectId: string | undefined = undefined;
  if (cachedArgs.values.project || cachedArgs.values.projectEnvVar) {
    projectId =
      cachedArgs.values.project ||
      (await Env.get({ key: cachedArgs.values.projectEnvVar }));
  }

  Shell.configure({
    showCommands: !!cachedArgs.values.verbose,
    silent: !cachedArgs.values.verbose
  });

  if (ready() && !!projectId) {
    const cachedProject = await projects.describe({ projectId });
    if (cachedProject) {
      projects.active.activate(cachedProject);
    } else {
      if (cachedArgs.values.project) {
        throw new Error(
          `${Colors.optionArg('--project')} argument ${Colors.quotedValue(`"${cachedArgs.values.project}"`)} unknown`
        );
      } else if (cachedArgs.values.projectEnvVar) {
        throw new Error(
          `Project ID in .env variable ${Colors.varName(cachedArgs.values.projectEnvVar)} = ${Colors.quotedValue(
            `"${await Env.get({ key: cachedArgs.values.projectEnvVar })}"`
          )} unknown`
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

export async function prepare(options: Parameters<(typeof Core)['init']>[0]) {
  return await Core.init(options);
}
