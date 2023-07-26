import cli, { Options } from '@battis/qui-cli';
import project from './project';

export default {
  init: function(options: Partial<Options> = {}) {
    const { env, ...rest } = options;
    const args = cli.init({
      env: { loadDotEnv: true, setRootAsCurrentWorkingDirectory: true, ...env },
      ...rest
    });
    project.id.set(process.env.PROJECT);
    return args;
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
