import * as lib from '#lib';
import { Project } from './Project.js';
import { active } from './active.js';
import { create } from './create/create.js';
import { list } from './list.js';

type Options = {
  project?: Project;
  activate?: boolean;
} & lib.PartialOptions<typeof lib.prompts.select<Project, Project>> &
  lib.PartialOptions<typeof create>;

export async function factory({
  project = active.get(),
  activate,
  ...options
}: Options = {}) {
  if (project) {
    if (activate) {
      active.activate(project);
    }
    return project;
  }
  return lib.prompts.select<Project, Project>({
    argTransform: () => undefined,
    message: 'Google Cloud project',
    choices: async () =>
      (await list()).map((p) => ({
        name: p.name,
        description: p.projectId,
        value: p
      })),
    active: activate ? active : undefined,
    create: async (projectId?: string) =>
      await create({ projectId, ...options })
  });
}
