import * as lib from '#lib';
import { gcloud } from '#shell';
import { ServiceAccount } from './ServiceAccount.js';

export async function describe({ email }: { email: lib.Email }) {
  return await gcloud<ServiceAccount, lib.Undefined.Value>(
    `iam service-accounts describe ${email}`,
    { error: lib.Undefined.callback }
  );
}
