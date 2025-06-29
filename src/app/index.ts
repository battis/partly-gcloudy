import { AppEngine } from './AppEngine.js';
import { DeploymentConfig } from './DeploymentConfig.js';
import * as regions from './regions/index.js';
import * as versions from './versions/index.js';
import * as lib from '../lib/index.js';
import * as services from '../services/index.js';
import * as shell from '../shell/index.js';

export { AppEngine, DeploymentConfig, regions, versions };

export async function describe() {
  return await shell.gcloud<AppEngine, lib.Undefined.Value>('app describe', {
    error: lib.Undefined.callback
  });
}

/**
 * There can only be one AppEngine instance per project, so if one already exists it will be returned rather than created
 * @param {Partial<CreateOptions>} options
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
