import * as lib from '#lib';
import { gcloud } from '#shell';
import { Account } from './Account.js';

export async function describe({ accountId }: describe.Options) {
  return await gcloud<Account, lib.Undefined.Value>(
    `billing accounts describe ${accountId}`,
    { error: lib.Undefined.callback }
  );
}

export namespace describe {
  export type Options = { accountId: string };
}
