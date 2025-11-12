import * as lib from '../../lib/index.js';
import * as shell from '../../shell/index.js';
import { Account } from './Account.js';

export async function describe({ accountId }: { accountId: string }) {
  return await shell.gcloud<Account, lib.Undefined.Value>(
    `billing accounts describe ${accountId}`,
    { error: lib.Undefined.callback }
  );
}
