import services from '../services';
import shell from '../shell';
import { DeployResponse } from './deploy';
import regions from './regions';

export type AppEngine = {
  authDomain: string;
  codeBucket: string;
  databaseType: string;
  defaultBucket: string;
  defaultHostname: string;
  featureSettings: {
    splitHealthChecks: boolean;
    useContainerOptimizedOs: true;
  };
  gcrDomain: string;
  iap: {
    enable: boolean;
    oauth2ClientId: string;
    oauth2ClientSecretSha256: string;
  };
  id: string;
  locationId: string;
  name: string;
  serviceAccount: string;
  servingStatus: string;
};

type CreateOptions = {
  region: string;
};

const describe = async () => shell.gcloud<AppEngine>('app describe');

export default {
  regions,
  describe,

  /**
   * There can only be one AppEngine instance per project, so if one already exists it will be returned rather than created
   * @param {Partial<CreateOptions>} options
   */
  create: async function(options?: Partial<CreateOptions>) {
    services.enable({ service: services.API.AppEngineAdminAPI });
    let instance = await describe();
    if (instance == null) {
      instance = shell.gcloud<AppEngine>(
        `app create --region=${await regions.selectIdentifier({
          region: options.region,
          purpose: 'to create App Engine instance'
        })}`
      );
    }
    return instance;
  },

  deploy: async () => shell.gcloud<DeployResponse>('app deploy'),

  logs: async () =>
    shell.gcloud('app logs tail -s default', {
      overrideBaseFlags: true,
      flags: { format: 'text' }
    })
};
