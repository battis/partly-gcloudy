import * as lib from '#lib';
import { active } from './active.js';
import { Brand } from './Brand.js';
import { create } from './create.js';
import { describe } from './describe.js';
import { list } from './list.js';

export async function select({
  brand,
  activate,
  activateIfCreated = true,
  ...rest
}: {
  brand?: string;
  activate?: boolean;
} & Partial<lib.prompts.select.Parameters<Brand>> &
  Partial<Parameters<typeof create>[0]> &
  Partial<Parameters<typeof list>[0]> = {}) {
  return await lib.prompts.select<Brand>({
    arg: brand,
    argTransform: async (name: string) => await describe({ name }),
    message: 'IAP OAuth brand',
    choices: async () =>
      (await list({ ...rest })).map((b: Brand) => ({
        name: b.applicationTitle,
        value: b,
        desription: b.name
      })),
    transform: (b: Brand) => b.name,
    active: activate ? active : undefined,
    create: async (applicationTitle?: string) =>
      await create({ applicationTitle, activate, ...rest }),
    activateIfCreated,
    ...rest
  });
}
