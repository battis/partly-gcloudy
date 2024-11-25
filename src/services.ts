import * as lib from './lib.js';
import { API } from './services/API.js';
import { Service } from './services/Service.js';
import * as shell from './shell.js';

export { API, Service };

type ServiceIdentifier = string;

export async function describe({ service }: { service: ServiceIdentifier }) {
  return (
    await shell.gcloud<Service[], lib.Undefined.Value>(
      `services list --available --filter=config.name=${service}`,
      { error: lib.Undefined.callback }
    )
  )?.shift();
}

export async function list() {
  return await shell.gcloud<Service[]>('services list --available');
}

export async function enable({
  service,
  ...rest
}: Partial<lib.prompts.select.Parameters<Service>> & {
  service?: ServiceIdentifier;
} = {}) {
  service =
    service ||
    (await lib.prompts.select<Service>({
      arg: service,
      argTransform: async (service: string) => await describe({ service }),
      message: 'Service to enable',
      choices: async () =>
        (await list()).map((s) => ({
          name: s.config.title,
          value: s,
          description: s.config.name
        })),
      transform: (s: Service) => s.config.name,
      ...rest
    }));
  return await shell.gcloud(`services enable ${service}`);
}
