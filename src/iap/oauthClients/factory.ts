import * as lib from '../../lib/index.js';
import { Client } from './Client.js';
import { create } from './create.js';
import { describe } from './describe.js';
import { list } from './list.js';

export async function factory({
  name,
  brand,
  ...rest
}: {
  name?: string;
  brand?: string;
} & Partial<lib.prompts.select.Parameters<Client, Client>> &
  Partial<Parameters<typeof create>[0]> &
  Partial<Parameters<typeof list>[0]> = {}) {
  return await lib.prompts.select<Client, Client>({
    arg: name,
    argTransform: async (name: string) => await describe({ name }),
    message: 'IAP OAuth client',
    choices: async () =>
      (await list({ brand, ...rest })).map((c) => ({
        name: c.displayName,
        value: c,
        description: c.name
      })),
    create: async (displayName?: string) =>
      await create({ displayName, ...rest }),
    ...rest
  });
}
