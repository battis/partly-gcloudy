import * as billing from '#billing';
import * as core from '#core';
import * as projects from '#projects';
import { Colors } from '@qui-cli/colors';
import { Env } from '@qui-cli/env';
import * as lib from '../lib/index.js';

type Options = {
  name?: string;
  defaultName?: string;
  /** @deprecated Use {$link defaultName} */
  suggestedName?: string;
  projectId?: string;
  env?: true | string;
  billingAccountId?: true | string;
};

export async function initialize({
  name,
  defaultName,
  suggestedName,
  projectId,
  env = true,
  billingAccountId
}: Options = {}) {
  if (core.ready()) {
    const args = core.args();

    const project = await projects.create({
      name,
      defaultName: defaultName || suggestedName,
      id: args.values.project
    });
    projectId = project.projectId;
    if (env) {
      Env.set({
        key: args.values.projectEnvVar,
        value: projectId,
        ...lib.filePathFrom(env)
      });
    }

    if (billingAccountId) {
      await billing.projects.enable({
        account: billingAccountId === true ? undefined : billingAccountId,
        projectId
      });
    }
    return { project };
  }
  throw new Error(`${Colors.command('gcloud')} is not ready.`);
}
