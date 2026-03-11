import { Env } from '@qui-cli/env';
import * as core from '../../gcloud.js';
import {
  AccessLevel,
  enableServiceAccountSecretsAccess
} from '../iam/enableServiceAccountSecretsAccess.js';
import { filePathFrom } from '../lib/filePathFrom.js';
import * as projects from '../projects/index.js';

type Options = {
  name?: string;
  defaultName?: string;
  projectId?: string;
  billingAccountId?: string;
  region?: string;
  secretsAccess?: AccessLevel | true;
  serviceAccount?: boolean | string | core.iam.serviceAccounts.ServiceAccount;
  env?: true | string;
  regionEnvVar?: string;
  serviceAccountEnvVar?: string;
} & Parameters<typeof projects.initialize>[0];

export const REGION_ENV_VAR = 'REGION';
export const SERVICE_ACCOUNT_ENV_VAR = 'SERVICE_ACCOUNT';

export async function initialize({
  region,
  secretsAccess,
  serviceAccount: _serviceAccount,
  env,
  regionEnvVar = REGION_ENV_VAR,
  serviceAccountEnvVar = SERVICE_ACCOUNT_ENV_VAR,
  ...options
}: Options = {}) {
  const { project } = await projects.initialize(options);

  await core.billing.projects.enable(options);
  await core.run_.isEnabled();
  await core.services.enable(core.services.API.CloudBuildAPI);
  await core.services.enable(core.services.API.ArtifactRegistryAPI);

  region = await core.run_.regions.select({ region });
  if (env) {
    Env.set({
      key: regionEnvVar,
      value: region,
      ...filePathFrom(env)
    });
  }

  let serviceAccount: core.iam.serviceAccounts.ServiceAccount | undefined =
    undefined;
  if (_serviceAccount || secretsAccess) {
    if (typeof _serviceAccount === 'string') {
      serviceAccount = await core.iam.serviceAccounts.describe({
        email: _serviceAccount
      });
    } else if (serviceAccount === true) {
      serviceAccount = await core.iam.serviceAccounts.create({
        defaultDisplayName: 'Cloud Run Service Identity'
      });
    }
    if (env && serviceAccount) {
      Env.set({
        key: serviceAccountEnvVar,
        value: serviceAccount.email,
        ...filePathFrom(env)
      });
    }
  }
  if (serviceAccount && secretsAccess) {
    await enableServiceAccountSecretsAccess({
      serviceAccount: serviceAccount,
      accessLevel: secretsAccess === true ? undefined : secretsAccess
    });
  }

  return { project, region, serviceAccount };
}
