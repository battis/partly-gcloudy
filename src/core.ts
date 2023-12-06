import cli, { Arguments, Options } from '@battis/qui-cli';
import { RecursivePartial } from '@battis/typescript-tricks';
import * as projects from './projects';

let cachedArgs: Arguments;

let cachedReady: true | string;

export function args() {
  return cachedArgs;
}

export async function init({
  env = {},
  args = {},
  ...initOptions
}: RecursivePartial<Options> = {}) {
  if (!cachedArgs) {
    env = {
      loadDotEnv: true,
      setRootAsCurrentWorkingDirectory: true,
      ...env
    };
    args = {
      ...args,
      flags: {
        ...args.flags,
        verbose: {
          short: 'v',
          description: 'Show verbose output (commands and results)'
        }
      },
      options: {
        ...args.options,
        project: {
          short: 'p',
          description: 'Google Cloud project ID'
        },
        projectEnvVar: {
          description:
            'Environment variable that stores Google Cloud project ID',
          default: 'PROJECT'
        }
      }
    };

    cachedArgs = cli.init({ ...initOptions, env, args });

    projects.active.activate(
      await projects.describe({
        projectId:
          cachedArgs.values.project ||
          process.env[cachedArgs.values.projectEnvVar]
      })
    );

    cli.shell.setShowCommands(!!cachedArgs.values.verbose);
    cli.shell.setSilent(!cachedArgs.values.verbose);
  }
  return cachedArgs;
}

export function ready({ fail = true }: { fail?: boolean } = {}) {
  if (cachedReady === undefined) {
    cachedReady =
      /\d+\.\d/.test(cli.shell.exec('gcloud --version').stdout) ||
      `gcloud is required. Install from ${cli.colors.url(
        'https://cloud.google.com/sdk/docs/install'
      )}`;
  }
  if (cachedReady !== true) {
    // TODO just install and authorize gcloud interactively
    if (fail) {
      throw new Error(cachedReady);
    } else {
      cli.log.fatal(cachedReady);
    }
  }
  return cachedReady;
}
