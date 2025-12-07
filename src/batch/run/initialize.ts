import { Env } from '@qui-cli/env-1password';
import * as billing from '../../billing/index.js';
import * as gcloud from '../../gcloud.js';
import * as iam from '../../iam/index.js';
import * as projects from '../../projects/index.js';
import * as run from '../../run/index.js';
import * as services from '../../services/index.js';
import {
  AccessLevel,
  enableServiceAccountSecretsAccess
} from '../iam/enableServiceAccountSecretsAccess.js';
import { filePathFrom } from '../lib/filePathFrom.js';

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
};

export const REGION_ENV_VAR = 'REGION';
export const SERVICE_ACCOUNT_ENV_VAR = 'SERVICE_ACCOUNT';

export async function initialize({
  name,
  defaultName,
  projectId,
  billingAccountId,
  region,
  secretsAccess,
  serviceAccount: _serviceAccount,
  env,
  regionEnvVar = REGION_ENV_VAR,
  serviceAccountEnvVar = SERVICE_ACCOUNT_ENV_VAR
}: Options = {}) {
  const projectEnvVar = gcloud.args().values.projectEnvVar;
  const project = await projects.create({ name, defaultName, projectId });
  projectId = project.projectId;
  if (env) {
    Env.set({
      key: projectEnvVar,
      value: projectId,
      ...filePathFrom(env)
    });
  }

  await billing.projects.enable({ account: billingAccountId, projectId });

  await services.enable(services.API.CloudRunAdminAPI);
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
