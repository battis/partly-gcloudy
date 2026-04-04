import * as billing from '#billing';
import * as iam from '#iam';
import * as run from '#run';
import * as services from '#services';
import { Env } from '@qui-cli/env';
import {
  AccessLevel,
  enableServiceAccountSecretsAccess
} from '../iam/enableServiceAccountSecretsAccess.js';
import { filePathFrom } from '../lib/filePathFrom.js';
import { initialize as initializeProject } from '../projects/initialize.js';

type Options = {
  name?: string;
  defaultName?: string;
  projectId?: string;
  billingAccountId?: string;
  region?: string;
  secretsAccess?: AccessLevel | true;
  serviceAccount?: boolean | string | iam.serviceAccounts.ServiceAccount;
  env?: true | string;
  regionEnvVar?: string;
  serviceAccountEnvVar?: string;
} & Parameters<typeof initializeProject>[0];

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
  const { project } = await initializeProject(options);

  await billing.projects.enable({
    ...options,
    projectId: project.projectId
  });
  await run.isEnabled();
  await services.enable(services.API.CloudBuildAPI);
  await services.enable(services.API.ArtifactRegistryAPI);

  region = await run.regions.select({ region });
  if (env) {
    Env.set({
      key: regionEnvVar,
      value: region,
      ...filePathFrom(env)
    });
  }

  let serviceAccount: iam.serviceAccounts.ServiceAccount | undefined =
    undefined;
  if (_serviceAccount || secretsAccess) {
    if (typeof _serviceAccount === 'string') {
      serviceAccount = await iam.serviceAccounts.describe({
        email: _serviceAccount
      });
    } else if (serviceAccount === true) {
      serviceAccount = await iam.serviceAccounts.create({
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
