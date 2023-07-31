import cli, { Arguments, Options } from '@battis/qui-cli';
import { RecursivePartial } from '@battis/typescript-tricks';
import projects from './projects';

let cachedArgs: Arguments;
let cachedReady: true | string;

const debugOverridenArgument = (arg: string, argType: string) =>
  cli.log.debug(
    `${cli.colors.value(
      '@battis/partly-cloudy'
    )} overrides the ${cli.colors.value(arg)} ${argType} argument`
  );

type ReadyOptions = {
  fail: boolean;
};

export default {
  args: () => cachedArgs,

  init: function(initOptions?: RecursivePartial<Options>) {
    if (!cachedArgs) {
      const env = {
        loadDotEnv: true,
        setRootAsCurrentWorkingDirectory: true,
        ...(initOptions?.env || {})
      };
      const args = {
        ...(initOptions?.args || {}),
        flags: {
          ...(initOptions?.args?.flags || {}),
          verbose: {
            short: 'v',
            description: 'Show verbose output (commands and results)'
          }
        },
        options: {
          ...(initOptions?.args?.options || {}),
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
      if (initOptions?.args?.flags?.verbose)
        debugOverridenArgument('verbose', 'flag');
      if (initOptions?.args?.options?.project)
        debugOverridenArgument('project', 'option');
      if (initOptions?.args?.options?.projectEnvVar)
        debugOverridenArgument('projectEnvVar', 'option');

      cachedArgs = cli.init({ ...(initOptions || {}), env, args });

      projects.active.set(
        cachedArgs.values.project ||
        process.env[cachedArgs.values.projectEnvVar]
      );

      cli.shell.setShowCommands(!!cachedArgs.values.verbose);
      cli.shell.setSilent(!cachedArgs.values.verbose);
    }
    return cachedArgs;
  },

  ready: function(options?: ReadyOptions) {
    const { fail = true } = options || {};
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
};
