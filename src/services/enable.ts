import * as lib from '#lib';
import { gcloud } from '#shell';
import { describe, ServiceIdentifier } from './describe.js';
import { list } from './list.js';
import { Service } from './Service.js';

type Options = {
  service?: ServiceIdentifier;
} & lib.PartialOptions<typeof lib.prompts.select<Service>>;

export async function enable({ service, ...options }: Options = {}) {
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
      ...options
    }));
  return await gcloud(`services enable ${service}`);
}
