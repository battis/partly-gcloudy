import * as lib from '#lib';
import { gcloud } from '#shell';
import { Client } from './Client.js';

export async function describe({ name }: { name: string }) {
  return await gcloud<Client, lib.Undefined.Value>(
    `iap oauth-clients describe ${name}`,
    { error: lib.Undefined.callback }
  );
}
