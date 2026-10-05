import * as lib from '#lib';
import { Project } from './Project.js';
import { active } from './active.js';
import { create } from './create/create.js';
import { describe } from './describe.js';
import { list } from './list.js';

type Options = {
  projectId?: string;
  activate?: boolean;
} & lib.PartialOptions<typeof lib.prompts.select<Project>> &
  lib.PartialOptions<typeof create>;

export async function select({
  projectId,
  activate = true,
  ...options
}: Options = {}) {
  return await lib.prompts.select<Project>({
    arg: projectId || active.get()?.projectId,
    argTransform: async (projectId?: string) => {
      if (projectId == active.get()?.projectId) {
        return active.get();
      }
      return await describe({ projectId });
    },
    message: 'Google Cloud project',
    /*
     * describe returns creation time precise to 1/1000000th of a second, but
     * list only returns creation time precise to 1/1000th of a second
     */
    isEqual: (a: Project, b: Project) => a.projectId === b.projectId,
    choices: async () =>
      (await list()).map((p) => ({
        name: p.name,
        value: p,
        description: p.projectId
      })),
    transform: (p: Project) => p.projectId,
    active: activate ? active : undefined,
    create: async (projectId?: string) =>
      await create({ projectId, ...options }),
    ...options
  });
}
