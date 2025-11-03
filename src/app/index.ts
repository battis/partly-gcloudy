import * as lib from '../lib/index.js';
import * as services from '../services/index.js';
import * as shell from '../shell/index.js';
import { AppEngine } from './AppEngine.js';
import { DeploymentConfig } from './DeploymentConfig.js';
import * as regions from './regions/index.js';
import * as versions from './versions/index.js';

export { AppEngine, DeploymentConfig, regions, versions };

export async function describe() {
  return await shell.gcloud<AppEngine, lib.Undefined.Value>('app describe', {
    error: lib.Undefined.callback
  });
}

/**
 * There can only be one AppEngine instance per project, so if one already
 * exists it will be returned rather than created
 */
export async function create({ region }: { region?: string } = {}) {
  await services.enable(services.API.AppEngineAdminAPI);
  let instance = await describe();
  if (!instance) {
    instance = await shell.gcloud<AppEngine>(
      `app create --region=${await regions.selectIdentifier({
        region,
        purpose: 'to create App Engine instance'
      })}`
    );
  }
  return instance;
}

export async function deploy() {
  return await shell.gcloud<DeploymentConfig>('app deploy', {
    error: (result) => {
      throw new Error(result.stderr);
    }
  });
}

export async function logs() {
  // TODO app logs should be configurable
  return await shell.gcloud('app logs tail -s default', {
    overrideBaseFlags: true,
    flags: { format: 'text' }
  });
}

type UpdateOptions = {
  serviceAccount?: string;
  splitHealthChecks?: boolean;
  sslPolicy?: 'TLS_VERSION_1_0' | 'TLS_VERSION_1_2';
};

export async function update({
  serviceAccount,
  splitHealthChecks,
  sslPolicy
}: UpdateOptions) {
  return await shell.gcloud(
    `app update${
      serviceAccount !== undefined
        ? ` --service-account="${serviceAccount}"`
        : ''
    }${
      splitHealthChecks !== undefined
        ? splitHealthChecks
          ? ' --split-health-checks'
          : ' --no-split-health-checks'
        : ''
    }${sslPolicy !== undefined ? ` --ssl-policy=${sslPolicy}` : ''}`
  );
}
