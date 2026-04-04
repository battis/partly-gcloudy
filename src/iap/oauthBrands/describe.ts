import * as lib from '#lib';
import { gcloud } from '#shell';
import { Brand } from './Brand.js';

export async function describe({ name }: { name: string }) {
  return gcloud<Brand, lib.Undefined.Value>(
    `iap oauth-brands describe ${name}`,
    { error: lib.Undefined.callback }
  );
}
