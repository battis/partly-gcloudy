import * as lib from '../lib/index.js';
import * as shell from '../shell/index.js';
import { Project } from './Project.js';
import { active } from './active.js';
import { create } from './create.js';
import { factory } from './factory.js';
import { list } from './list.js';
import { select } from './select.js';

/** @deprecated Use {@link select} */
export const selectProjectId = select;

/** @deprecated Use {@link select} */
export const selectIdentifier = select;

/** @deprecated Use {@link factory} */
export const selectProject = factory;

/** @deprecated Use {@link active} */
export const id = active;

export async function selectProjectNumber({
  projectNumber,
  activate,
  ...rest
}: Partial<lib.prompts.select.Parameters<Project, string>> &
  Partial<Parameters<typeof create>[0]> & {
    projectNumber?: string | number;
    activate?: boolean;
  } = {}) {
  return await lib.prompts.select({
    arg: projectNumber?.toString() || active.get()?.projectNumber,
    argTransform: async (projectNumber: string) => {
      if (projectNumber === active.get()?.projectNumber) {
        return active.get();
      } else {
        return (
          await shell.gcloud<Project[]>(
            `projects list --filter=projectNumber=${projectNumber}`
          )
        ).shift();
      }
    },
    message: 'Google Cloud project',
    choices: async () =>
      (await list()).map((p) => ({
        name: p.name,
        value: p,
        description: p.projectNumber
      })),
    transform: (p: Project) => p.projectNumber,
    active: activate ? active : undefined,
    ...rest
  });
}
