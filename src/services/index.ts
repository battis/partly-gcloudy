import * as lib from '../lib';
import * as shell from '../shell';
import API from './api';
import Service from './Service';

type ServiceIdentifier = string;

export function list() {
  return shell.gcloud<Service[]>('services list --available');
}

export async function enable({
  service,
  ...rest
}: Partial<lib.prompts.select.Parameters.ValueToString<Service>> & {
  service?: ServiceIdentifier;
} = undefined) {
  service = await lib.prompts.select<Service>({
    arg: service,
    message: 'Service to enable',
    choices: async () =>
      list().map((s) => ({
        name: s.config.title,
        value: s,
        description: s.config.name
      })),
    transform: (s: Service) => s.config.name,
    ...rest
  });
  return shell.gcloud(`services enable ${service}`);
}

export { API, type Service };
