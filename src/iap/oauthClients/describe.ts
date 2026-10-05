import * as lib from '#lib';
import { gcloud } from '#shell';
import { Client } from './Client.js';

type Options = {
  name: string;
};

export async function describe({ name }: Options) {
  return await gcloud<Client, lib.Undefined.Value>(
    `iap oauth-clients describe ${name}`,
    { error: lib.Undefined.callback }
  );
}
