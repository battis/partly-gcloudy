import lib from '../lib';
import shell from '../shell';
import API from './api';
import TService from './Service';

type ServiceIdentifier = string;

class services {
  protected constructor() {
    // ignore
  }

  public static API = API;

  public static list = () =>
    shell.gcloud<services.Service[]>('services list --available');

  public static async enable({
    service,
    ...rest
  }: Partial<lib.prompts.select.Parameters.ValueToString<services.Service>> & {
    service?: ServiceIdentifier;
  } = undefined) {
    service = await lib.prompts.select<services.Service>({
      arg: service,
      message: 'Service to enable',
      choices: async () =>
        this.list().map((s) => ({
          name: s.config.title,
          value: s,
          description: s.config.name
        })),
      transform: (s: services.Service) => s.config.name,
      ...rest
    });
    return shell.gcloud(`services enable ${service}`);
  }
}

namespace services {
  export type Service = TService;
}

export { services as default };
