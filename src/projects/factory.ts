import * as lib from '../lib/index.js';
import { Project } from './Project.js';
import { active } from './active.js';
import { create } from './create.js';
import { list } from './list.js';

export async function factory({
  project = active.get(),
  activate,
  ...rest
}: Partial<lib.prompts.select.Parameters<Project, Project>> &
  Partial<Parameters<typeof create>[0]> & {
    project?: Project;
    activate?: boolean;
  } = {}) {
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
    create: async (projectId?: string) => await create({ projectId, ...rest })
  });
}
