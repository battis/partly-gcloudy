import AppEngine from './app/AppEngine.js';
import DeploymentConfig from './app/DeploymentConfig.js';
import * as regions from './app/regions.js';
import * as versions from './app/versions.js';
import * as lib from './lib.js';
import * as services from './services.js';
import * as shell from './shell.js';

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

export { regions, versions };
export type { AppEngine, DeploymentConfig };
