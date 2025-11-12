import type { Email } from '../../lib/index.js';
import * as lib from '../../lib/index.js';
import * as shell from '../../shell/index.js';
import { ServiceAccount } from './ServiceAccount.js';

export async function describe({ email }: { email: Email }) {
  return await shell.gcloud<ServiceAccount, lib.Undefined.Value>(
    `iam service-accounts describe ${email}`,
    { error: lib.Undefined.callback }
  );
}
