import * as lib from '../../lib/index.js';
import { Account } from './Account.js';
import { describe } from './describe.js';
import { list } from './list.js';

export async function select({
  name,
  ...rest
}: {
  name?: string;
} & Partial<lib.prompts.select.Parameters<Account>> = {}) {
  return await lib.prompts.select<Account>({
    arg: name,
    argTransform: async (accountId: string) => await describe({ accountId }),
    message: 'Billing account',
    choices: async () =>
      (await list()).map((a) => ({
        name: a.displayName,
        value: a,
        description: a.name,
        disabled: !a.open
      })),
    transform: (a: Account) => a.name,
    ...rest
  });
}
