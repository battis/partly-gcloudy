import * as lib from '#lib';
import { Client } from './Client.js';
import { create } from './create/create.js';
import { describe } from './describe.js';
import { list } from './list.js';

type Options = {
  name?: string;
  brand?: string;
} & lib.PartialOptions<typeof lib.prompts.select<Client, Client>> &
  lib.PartialOptions<typeof create> &
  lib.PartialOptions<typeof list>;

export async function factory({ name, brand, ...options }: Options = {}) {
  return await lib.prompts.select<Client, Client>({
    arg: name,
    argTransform: async (name: string) => await describe({ name }),
    message: 'IAP OAuth client',
    choices: async () =>
      (await list({ brand, ...options })).map((c) => ({
        name: c.displayName,
        value: c,
        description: c.name
      })),
    create: async (displayName?: string) =>
      await create({ displayName, ...options }),
    ...options
  });
}
