import * as lib from '../lib/index.js';
import * as shell from '../shell/index.js';
import { Service } from './Service.js';

export type ServiceIdentifier = string;

export async function describe({ service }: { service: ServiceIdentifier }) {
  return (
    await shell.gcloud<Service[], lib.Undefined.Value>(
      `services list --available --filter=config.name=${service}`,
      { error: lib.Undefined.callback }
    )
  )?.shift();
}
