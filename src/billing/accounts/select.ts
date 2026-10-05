import * as lib from '#lib';
import { Account } from './Account.js';
import { describe } from './describe.js';
import { list } from './list.js';

export async function select({ name, ...options }: select.Options = {}) {
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
    ...options
  });
}

export namespace select {
  export type Options = {
    name?: string;
    purpose?: string;
  } & Partial<lib.prompts.select.Options<Account>>;
}
