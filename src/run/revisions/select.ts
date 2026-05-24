import * as lib from '#lib';
import { Revision } from './Revision.js';
import * as List from './list.js';

type Options = { revision?: Revision['metadata']['name'] } & List.Options &
  Partial<lib.prompts.select.Parameters<Revision, string>>;

export async function select({ revision, ...rest }: Options = {}) {
  return await lib.prompts.select<Revision>({
    arg: revision,
    argTransform: async (revision: string) =>
      (await List.list({ ...rest }))
        .filter((r) => r.metadata.name === revision)
        .shift(),
    message: 'Google Cloud Run revision',
    choices: async () =>
      (await List.list()).map((r) => ({
        name: `${r.metadata.name} (${r.metadata.creationTimestamp})`,
        value: r
      })),
    transform: (r: Revision) => r.metadata.name,
    ...rest
  });
}
