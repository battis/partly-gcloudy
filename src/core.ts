import { Colors } from '@battis/qui-cli.colors';
import { Shell } from '@battis/qui-cli.shell';
import * as projects from './projects.js';

type Arguments = {
  values: { verbose?: boolean; project?: string; projectEnvVar: string };
};

let cachedArgs: Arguments;

let cachedReady: true | string;

export function args() {
  return cachedArgs;
}

export async function init(args: Arguments) {
  cachedArgs = args;

  Shell.configure({
    showCommands: !!cachedArgs.values.verbose,
    silent: !cachedArgs.values.verbose
  });

  if (
    cachedArgs.values.project ||
    process.env[cachedArgs.values.projectEnvVar]
  ) {
    const cachedProject = await projects.describe({
      projectId:
        cachedArgs.values.project ||
        process.env[cachedArgs.values.projectEnvVar]
    });
    if (cachedProject) {
      projects.active.activate(cachedProject);
    } else {
      if (cachedArgs.values.project) {
        throw new Error(
          `Project ID argument ${cachedArgs.values.project} unknown`
        );
      } else if (process.env[cachedArgs.values.projectEnvVar]) {
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
  return cachedArgs;
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
