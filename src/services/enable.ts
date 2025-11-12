import * as lib from '../lib/index.js';
import * as shell from '../shell/index.js';
import { describe, ServiceIdentifier } from './describe.js';
import { list } from './list.js';
import { Service } from './Service.js';

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
