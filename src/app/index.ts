import services from '../services';
import shell from '../shell';
import TAppEngine from './AppEngine';
import TDeploymentConfig from './DeploymentConfig';
import MRegions from './regions';

class app {
  protected constructor() {
    // ignore
  }

  public static async describe() {
    return shell.gcloud<app.AppEngine>('app describe');
  }

  /**
   * There can only be one AppEngine instance per project, so if one already exists it will be returned rather than created
   * @param {Partial<CreateOptions>} options
   */
  public static async create({ region }: { region?: string } = undefined) {
    services.enable({ service: services.API.AppEngineAdminAPI });
    let instance = await this.describe();
    if (instance == null) {
      instance = shell.gcloud<app.AppEngine>(
        `app create --region=${await this.regions.selectIdentifier({
          region,
          purpose: 'to create App Engine instance'
        })}`
      );
    }
    return instance;
  }

  public static deploy() {
    return shell.gcloud<app.DeploymentConfig>('app deploy');
  }

  public static logs() {
    // TODO app logs should be configurable
    return shell.gcloud('app logs tail -s default', {
      overrideBaseFlags: true,
      flags: { format: 'text' }
    });
  }
}

namespace app {
  export type AppEngine = TAppEngine;
  export type DeploymentConfig = TDeploymentConfig;
  export import regions = MRegions; // eslint-disable-line @typescript-eslint/no-unused-vars
}

export { app as default };
