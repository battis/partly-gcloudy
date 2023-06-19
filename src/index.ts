import cli from '@battis/cli';
import { execSync } from 'node:child_process';
import * as iam from './identityAccessManagement';
import * as iap from './identityAwareProxy';
import invoke from './invoke';
import * as project from './project';
import * as secrets from './secretManager';
export * as appEngine from './appEngine';
export * as beta from './beta';
export * as billing from './billing';
export * as flags from './flags';
export * as scheduler from './scheduler';
export * as services from "./services";

export default {
  invoke,
  ready: (fail = true) => {
    if (!/\d+\.\d/.test(execSync('gcloud --version').toString())) {
      // TODO just install and authorize gcloud interactively
      if (fail) {
        throw new Error(
          'gcloud is required. Install from https://cloud.google.com/sdk/docs/install'
        );
      } else {
        cli.logger.log(
          cli.logger.level.fatal,
          `${cli.io.error('gcloud is required.')} Install from ${cli.io.url(
            'https://cloud.google.com/sdk/docs/install'
          )}`
        );
        return false;
      }
    }
    return true;
  },

  iam,
  identityAccessManagement: iam,

  iap,
  identyAwareProxy: iap,

  project,
  projects: project,

  secrets,
  secretManager: secrets
};
