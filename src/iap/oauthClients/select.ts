import * as lib from '../../lib/index.js';
import { Client } from './Client.js';
import { describe } from './describe.js';
import { list } from './list.js';

export async function select({
  name,
  brand,
  ...rest
}: Partial<lib.prompts.select.Parameters<Client>> &
  Partial<Parameters<typeof list>>[0] & {
    name?: string;
    brand?: string;
  } = {}) {
  return await lib.prompts.select<Client>({
    arg: name,
    argTransform: async (name: string) => await describe({ name }),
    message: 'IAP OAuth client',
    choices: async () =>
      (await list({ brand, ...rest })).map((c) => ({
        name: c.displayName,
        value: c,
        description: c.name
      })),
    transform: (c: Client) => c.name,
    ...rest
  });
}
