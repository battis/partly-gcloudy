import * as lib from '#lib';
import { ServiceAccount } from './ServiceAccount.js';
import { describe } from './describe.js';
import { list } from './list.js';

type Options = {
  email?: lib.Email;
  purpose?: string;
};

export async function select({ email, ...options }: Options = {}) {
  return lib.prompts.select({
    arg: email,
    argTransform: async (email: string) => await describe({ email }),
    message: 'Service account',
    choices: async () =>
      (await list()).map((s) => ({
        name: s.displayName,
        value: s,
        description: s.email
      })),
    transform: (s: ServiceAccount) => s.email,
    ...options
  });
}
