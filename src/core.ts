import cli, { Arguments, Options } from '@battis/qui-cli';
import { RecursivePartial } from '@battis/typescript-tricks';
import projects from './projects';

class core {
  protected constructor() {
    // ignore
  }

  private static cachedArgs?: Arguments;

  private static cachedReady?: true | string;

  public static args = () => this.cachedArgs;

  private static debugOverridenArgument = (arg: string, argType: string) =>
    cli.log.debug(
      `${cli.colors.value(
        '@battis/partly-cloudy'
      )} overrides the ${cli.colors.value(arg)} ${argType} argument`
    );

  public static async init({
    env = {},
    args = {},
    ...initOptions
  }: RecursivePartial<Options> = {}) {
    if (!this.cachedArgs) {
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
      if (args.flags.verbose) this.debugOverridenArgument('verbose', 'flag');
      if (args.options.project)
        this.debugOverridenArgument('project', 'option');
      if (args.options.projectEnvVar)
        this.debugOverridenArgument('projectEnvVar', 'option');

      this.cachedArgs = cli.init({ ...initOptions, env, args });

      projects.active.activate(
        await projects.describe({
          projectId:
            this.cachedArgs.values.project ||
            process.env[this.cachedArgs.values.projectEnvVar]
        })
      );

      cli.shell.setShowCommands(!!this.cachedArgs.values.verbose);
      cli.shell.setSilent(!this.cachedArgs.values.verbose);
    }
    return this.cachedArgs;
  }

  public static ready({ fail = true }: { fail?: boolean } = undefined) {
    if (this.cachedReady === undefined) {
      this.cachedReady =
        /\d+\.\d/.test(cli.shell.exec('gcloud --version').stdout) ||
        `gcloud is required. Install from ${cli.colors.url(
          'https://cloud.google.com/sdk/docs/install'
        )}`;
    }
    if (this.cachedReady !== true) {
      // TODO just install and authorize gcloud interactively
      if (fail) {
        throw new Error(this.cachedReady);
      } else {
        cli.log.fatal(this.cachedReady);
      }
    }
    return this.cachedReady;
  }
}

namespace core { }

export { core as default };
