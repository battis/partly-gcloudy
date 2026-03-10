import { Colors } from '@qui-cli/colors';
import { Env } from '@qui-cli/env';
import * as gcloud from '../../gcloud.js';
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
  if (gcloud.ready()) {
    const args = gcloud.args();

    const project = await gcloud.projects.create({
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
      await gcloud.billing.projects.enable({
        account: billingAccountId === true ? undefined : billingAccountId,
        projectId
      });
    }
    return { project };
  }
  throw new Error(`${Colors.command('gcloud')} is not ready.`);
}
