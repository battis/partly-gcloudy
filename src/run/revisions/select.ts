import * as lib from '#lib';
import { Revision } from './Revision.js';
import * as List from './list.js';

type Options = { revision?: Revision['metadata']['name'] } & List.Options &
  lib.PartialOptions<typeof lib.prompts.select<Revision, string>>;

export async function select({ revision, ...options }: Options = {}) {
  return await lib.prompts.select<Revision>({
    arg: revision,
    argTransform: async (revision: string) =>
      (await List.list({ ...options }))
        .filter((r) => r.metadata.name === revision)
        .shift(),
    message: 'Google Cloud Run revision',
    choices: async () =>
      (await List.list()).map((r) => ({
        name: `${r.metadata.name} (${r.metadata.creationTimestamp})`,
        value: r
      })),
    transform: (r: Revision) => r.metadata.name,
    ...options
  });
}
