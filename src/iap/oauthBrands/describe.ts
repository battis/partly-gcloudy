import * as lib from '../../lib/index.js';
import * as shell from '../../shell/index.js';
import { Brand } from './Brand.js';

export async function describe({ name }: { name: string }) {
  return shell.gcloud<Brand, lib.Undefined.Value>(
    `iap oauth-brands describe ${name}`,
    { error: lib.Undefined.callback }
  );
}
