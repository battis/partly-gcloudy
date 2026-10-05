import * as lib from '#lib';
import { gcloud } from '#shell';
import { Service } from './Service.js';

export type ServiceIdentifier = string;

type Options = {
  service: ServiceIdentifier;
};

export async function describe({ service }: Options) {
  return (
    await gcloud<Service[], lib.Undefined.Value>('services list', {
      flags: {
        available: true,
        filter: `config.name=${service}`
      },
      error: lib.Undefined.callback
    })
  )?.shift();
}
