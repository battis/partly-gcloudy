import { Colors } from '@qui-cli/colors';
import { Env } from '@qui-cli/env';
import { Log } from '@qui-cli/log';
import * as core from '../../core.js';
import * as iam from '../../iam/index.js';
import { input } from '../../lib/prompts/input.js';
import * as projects from '../../projects/index.js';
import * as run from '../../run/index.js';
import { gcloud } from '../../shell/index.js';
import { filePathFrom } from '../lib/filePathFrom.js';
import {
  initialize,
  REGION_ENV_VAR,
  SERVICE_ACCOUNT_ENV_VAR
} from './initialize.js';

type Options = {
  projectId?: string;
  serviceName?: string;
  serviceNameEnvVar?: string;
  region?: string;
  serviceAccount?: string | iam.serviceAccounts.ServiceAccount;
  args?: Record<string, unknown>;
  env?: true | string;
} & Parameters<typeof initialize>[0];

export const DEFAULT_ARGS = {
  source: '.',
  'base-image': 'nodejs22',
  'automatic-updates': true
};

export const SERVICE_NAME_ENV_VAR = 'SERVICE_NAME';

function validServiceName(value?: string) {
  return (
    (!!value && /^[a-z][a-z0-9-]{0,62}/.test(value)) ||
    'Valid service names must be no more than 63 characters, and contain only letters, numbers and hyphens'
  );
}

export async function deployService({
  projectId,
  serviceName,
  region,
  serviceAccount,
  args = DEFAULT_ARGS,
  env,
  serviceNameEnvVar = SERVICE_NAME_ENV_VAR,
  regionEnvVar = REGION_ENV_VAR,
  serviceAccountEnvVar = SERVICE_ACCOUNT_ENV_VAR,
  ...options
}: Options = {}) {
  const projectEnvVar = core.args().values.projectEnvVar;

  projectId =
    projectId || (await Env.get({ key: projectEnvVar, ...filePathFrom(env) }));

  if (!projectId) {
    const result = await initialize({
      region,
      serviceAccount,
      regionEnvVar,
      serviceAccountEnvVar,
      ...options
    });
    projectId = result.project.projectId;
    region = result.region;
    serviceAccount = result.serviceAccount?.email;
  }
  serviceName = await input({
    arg:
      serviceName ||
      (await Env.get({ key: serviceNameEnvVar, ...filePathFrom(env) })),
    message: 'Google Cloud Run service name',
    default: (serviceName || projects.active.get()?.name)
      ?.toLowerCase()
      .replaceAll(/[^a-z0-9-]+/gm, '-')
      .replaceAll(/-+/, '-')
      .substring(0, 63),
    validate: validServiceName
  });
  if (env && !process.env[serviceNameEnvVar]) {
    await Env.set({
      key: serviceNameEnvVar,
      value: serviceName,
      ...filePathFrom(env)
    });
  }

  region =
    region ||
    (await Env.get({ key: regionEnvVar, ...filePathFrom(env) })) ||
    (await run.regions.select({ region }));

  if (serviceAccount && typeof serviceAccount !== 'string') {
    serviceAccount = serviceAccount.email;
  }
  serviceAccount =
    serviceAccount ||
    (await Env.get({ key: serviceAccountEnvVar, ...filePathFrom(env) }));

  const service = await gcloud<run.deploy.DeploymentConfig>(
    `run deploy ${serviceName} --region=${region} ${serviceAccount ? `--service-account="${serviceAccount}" ` : ''}${Object.keys(
      args
    )
      .map((key) => {
        switch (typeof args[key]) {
          case 'boolean':
            return `--${args[key] ? '' : 'no-'}${key}`;
          case 'number':
            return `--${key}=${args[key]}`;
          default:
            return `--${key}="${args[key]}"`;
        }
      })
      .join(' ')}`
  );

  Log.info(
    `Cloud Run ${service.kind} ${Colors.value(
      service.metadata.name
    )} in project ${Colors.value(
      projects.active.getIdentifier()
    )} deployed to:\n\n${(
      JSON.parse(
        service.metadata.annotations['run.googleapis.com/urls']
      ) as string[]
    )
      .map((url) => `  ${Colors.url(url)}`)
      .join('\n')}\n`
  );

  return { service };
}
