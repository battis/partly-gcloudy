import * as services from '../services';
import * as shell from '../shell';
import AppEngine from './AppEngine';
import DeploymentConfig from './DeploymentConfig';
import * as regions from './regions';

export async function describe() {
  return shell.gcloud<AppEngine>('app describe');
}

/**
 * There can only be one AppEngine instance per project, so if one already exists it will be returned rather than created
 * @param {Partial<CreateOptions>} options
 */
export async function create({ region }: { region?: string } = {}) {
  services.enable({ service: services.API.AppEngineAdminAPI });
  let instance = await describe();
  if (instance == null) {
    instance = shell.gcloud<AppEngine>(
      `app create --region=${await regions.selectIdentifier({
        region,
        purpose: 'to create App Engine instance'
      })}`
    );
  }
  return instance;
}

export function deploy() {
  return shell.gcloud<DeploymentConfig>('app deploy');
}

export function logs() {
  // TODO app logs should be configurable
  return shell.gcloud('app logs tail -s default', {
    overrideBaseFlags: true,
    flags: { format: 'text' }
  });
}

export type { AppEngine, DeploymentConfig };
export { regions };
