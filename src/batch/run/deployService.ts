import { input } from '@inquirer/prompts';
import { Colors } from '@qui-cli/colors';
import { Env } from '@qui-cli/env';
import { Log } from '@qui-cli/log';
import { Shell } from '@qui-cli/shell';
import { Validators } from '@qui-cli/validators';
import * as gcloud from '../../gcloud.js';
import * as iam from '../../iam/index.js';
import * as run from '../../run/index.js';
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
  const projectEnvVar = gcloud.args().values.projectEnvVar;

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
  serviceName =
    serviceName ||
    (await Env.get({ key: serviceNameEnvVar, ...filePathFrom(env) })) ||
    (await input({
      message: 'Google Cloud Run service name',
      validate: Validators.notEmpty
    }));
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

  const service = JSON.parse(
    Shell.exec(
      `gcloud run deploy ${serviceName} --region=${region} ${serviceAccount ? `--service-account="${serviceAccount}" ` : ''}${Object.keys(
        args
      )
        .map((key) => {
          switch (typeof args[key]) {
            case 'boolean':
              return `--${key}`;
            case 'number':
              return `--${key}=${args[key]}`;
            default:
              return `--${key}="${args[key]}"`;
          }
        })
        .join(' ')} --project="${projectId}" --format=json --quiet`
    ).stdout
  ) as gcloud.run_.deploy.DeploymentConfig;

  Log.info(
    `Cloud Run ${service.kind} ${Colors.value(
      service.metadata.name
    )} in project ${Colors.value(
      gcloud.projects.active.getIdentifier()
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
