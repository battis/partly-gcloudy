import * as lib from '../../lib/index.js';
import * as shell from '../../shell/index.js';
import { Client } from './Client.js';

export async function describe({ name }: { name: string }) {
  return await shell.gcloud<Client, lib.Undefined.Value>(
    `iap oauth-clients describe ${name}`,
    { error: lib.Undefined.callback }
  );
}
