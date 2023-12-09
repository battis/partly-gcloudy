import * as lib from '../../lib';
import * as shell from '../../shell';
import Account from './Account';

export const active = new lib.Active<Account>(undefined);

export async function describe({ accountId }: { accountId: string }) {
  return await shell.gcloud<Account, lib.Undefined.Value>(
    `billing accounts describe ${accountId}`,
    { error: lib.Undefined.callback }
  );
}

export async function list() {
  return await shell.gcloud<Account[]>(
    'billing accounts list --filter=open=true'
  );
}

export async function selectName({
  name,
  ...rest
}: {
  name?: string;
} & Partial<lib.prompts.select.Parameters<Account>> = {}) {
  return await lib.prompts.select<Account>({
    arg: name,
    argTransform: async (accountId) => await describe({ accountId }),
    message: 'Billing account',
    choices: async () =>
      (
        await list()
      ).map((a) => ({
        name: a.displayName,
        value: a,
        description: a.name,
        disabled: !a.open
      })),
    transform: (a: Account) => a.name,
    ...rest
  });
}

export const selectidentifier = selectName;

export { type Account };
