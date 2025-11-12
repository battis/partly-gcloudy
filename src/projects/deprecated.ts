import * as lib from '../lib/index.js';
import * as shell from '../shell/index.js';
import { Project } from './Project.js';
import { active } from './active.js';
import { create } from './create.js';
import { factory } from './factory.js';
import { select } from './select.js';

/** @deprecated Use {@link select} */
export const selectProjectId = select;

/** @deprecated Use {@link select} */
export const selectIdentifier = select;

/** @deprecated Use {@link factory} */
export const selectProject = factory;

/** @deprecated Use {@link active} */
export const id = active;

/**
 * @deprecated Use {@link select} with custom argTransform, choices, and/or
 *   transform if needed
 */
export async function selectProjectNumber({
  projectNumber,
  ...rest
}: Partial<lib.prompts.select.Parameters<Project, string>> &
  Partial<Parameters<typeof create>[0]> & {
    projectNumber?: string | number;
    activate?: boolean;
  } = {}) {
  return select({
    arg: projectNumber?.toString(),
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
    transform: (p: Project) => p.projectNumber,
    ...rest
  });
}
