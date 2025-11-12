import type { Email } from '../../lib/index.js';
import * as lib from '../../lib/index.js';
import { ServiceAccount } from './ServiceAccount.js';
import { create } from './create.js';
import { describe } from './describe.js';
import { list } from './list.js';

export async function select({
  email,
  ...rest
}: Partial<lib.prompts.select.Parameters<ServiceAccount>> &
  Partial<Parameters<typeof create>[0]> & {
    email?: Email;
  } = {}) {
  return lib.prompts.select({
    arg: email,
    argTransform: async (email: string) => await describe({ email }),
    message: `Service account`,
    choices: async () =>
      (await list()).map((s) => ({
        name: s.displayName,
        value: s,
        description: s.email
      })),
    transform: (s: ServiceAccount) => s.email,
    ...rest
  });
}
