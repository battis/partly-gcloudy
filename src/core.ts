import cli, { Options } from '@battis/qui-cli';
import projects from './projects';

export default {
  init: function(options: Partial<Options> = {}) {
    const { env, args, ...rest } = options;
    const { flags, ...argsRest } = args;
    const { verbose, ...flagsRest } = flags;
    const _args = cli.init({
      env: { loadDotEnv: true, setRootAsCurrentWorkingDirectory: true, ...env },
      args: {
        flags: {
          verbose: {
            short: 'v',
            description: 'Show verbose output',
            ...verbose
          },
          ...flagsRest
        },
        ...argsRest
      },
      ...rest
    });
    projects.id.set(process.env.PROJECT);
    return _args;
  },

  ready: function(fail = true) {
    if (!/\d+\.\d/.test(cli.shell.exec('gcloud --version').stdout)) {
      // TODO just install and authorize gcloud interactively
      if (fail) {
        throw new Error(
          'gcloud is required. Install from https://cloud.google.com/sdk/docs/install'
        );
      } else {
        cli.log.fatal(
          `gcloud is required. Install from ${cli.colors.url(
            'https://cloud.google.com/sdk/docs/install'
          )}`
        );
        return false;
      }
    }
    return true;
  }
};
