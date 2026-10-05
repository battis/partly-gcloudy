import * as lib from '#lib';
import { gcloud } from '#shell';
import { Brand } from './Brand.js';

type Options = {
  name: string;
};

export async function describe({ name }: Options) {
  return gcloud<Brand, lib.Undefined.Value>(
    `iap oauth-brands describe ${name}`,
    { error: lib.Undefined.callback }
  );
}
