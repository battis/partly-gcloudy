import * as lib from '#lib';
import { active } from './active.js';
import { Brand } from './Brand.js';
import { create } from './create/create.js';
import { describe } from './describe.js';
import { list } from './list.js';

type Options = {
  brand?: string;
  activate?: boolean;
} & lib.PartialOptions<typeof lib.prompts.select<Brand>> &
  lib.PartialOptions<typeof create> &
  lib.PartialOptions<typeof list>;

export async function select({
  brand,
  activate,
  activateIfCreated = true,
  ...options
}: Options = {}) {
  return await lib.prompts.select<Brand>({
    arg: brand,
    argTransform: async (name: string) => await describe({ name }),
    message: 'IAP OAuth brand',
    choices: async () =>
      (await list({ ...options })).map((b: Brand) => ({
        name: b.applicationTitle,
        value: b,
        desription: b.name
      })),
    transform: (b: Brand) => b.name,
    active: activate ? active : undefined,
    create: async (applicationTitle?: string) =>
      await create({ applicationTitle, activate, ...options }),
    activateIfCreated,
    ...options
  });
}
