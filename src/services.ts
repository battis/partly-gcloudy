import cli from '@battis/qui-cli';
import shell from './shell';

type EnableOptions = {
  service: string;
  pageSize: number;
};

type StringMap = { [key: string]: string };
type Service = {
  config: {
    authentication: StringMap;
    documentation: StringMap;
    monitoredResources: [{ labels: [{ key: string }]; type: string }];
    monitoring: {
      consumerDestinations: [{ metrics: string[]; monitoredResource: string }];
    };
    name: string;
    quota: StringMap;
    title: string;
    usage: StringMap;
  };
  name: string;
  parent: string;
  state: string;
};

export default {
  API: {
    AdminSDKAPI: 'admin.googleapis.com',
    IdentityAwareProxyAPI: 'iap.googleapis.com',
    AppEngineAdminAPI: 'appengine.googleapis.com',
    SecretManagerAPI: 'secretmanager.googleapis.com',
    CloudSQLAdminAPI: 'sqladmin.googleapis.com'
  },

  enable: async function({ service, pageSize = 20 }: Partial<EnableOptions>) {
    pageSize = Math.max(7, pageSize);
    service =
      service ||
      (await cli.prompts.select({
        message: 'Service to enable',
        choices: shell
          .gcloud<Service[]>('services list --available')
          .map((service) => ({
            name: service.config.title,
            value: service.config.name
          })),
        pageSize
      }));
    shell.gcloud(`services enable ${service}`);
  }
};
