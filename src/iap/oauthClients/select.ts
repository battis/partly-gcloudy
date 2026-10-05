import * as lib from '#lib';
import { Client } from './Client.js';
import { describe } from './describe.js';
import { list } from './list.js';

type Options = {
  name?: string;
  brand?: string;
} & lib.PartialOptions<typeof lib.prompts.select<Client>> &
  lib.PartialOptions<typeof list>;

export async function select({ name, brand, ...options }: Options = {}) {
  return await lib.prompts.select<Client>({
    arg: name,
    argTransform: async (name: string) => await describe({ name }),
    message: 'IAP OAuth client',
    choices: async () =>
      (await list({ brand, ...options })).map((c) => ({
        name: c.displayName,
        value: c,
        description: c.name
      })),
    transform: (c: Client) => c.name,
    ...options
  });
}
