import * as lib from '#lib';
import { gcloud } from '#shell';
import { Service } from './Service.js';

export type ServiceIdentifier = string;

export async function describe({ service }: { service: ServiceIdentifier }) {
  return (
    await gcloud<Service[], lib.Undefined.Value>(
      `services list --available --filter=config.name=${service}`,
      { error: lib.Undefined.callback }
    )
  )?.shift();
}
