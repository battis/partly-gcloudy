import * as projects from '#projects';
import { gcloud } from '#shell';
import { Brand } from './Brand.js';
import * as lib from '#lib';

type Options = {
  project?: projects.Project;
  projectNumber?: number | string;
} & lib.PartialOptions<typeof projects.select>;

export async function list({
  project,
  projectNumber,
  ...options
}: Options = {}) {
  projectNumber =
    project?.projectNumber ||
    projectNumber ||
    (await projects.select({
      arg: projectNumber?.toString(),
      argTransform: async (projectNumber: string) => {
        if (projectNumber === projects.active.get()?.projectNumber) {
          return projects.active.get();
        } else {
          return (
            await gcloud<projects.Project[]>('projects list', {
              flags: { filter: `projectNumber=${projectNumber}` }
            })
          ).shift();
        }
      },
      transform: (p: projects.Project) => p.projectNumber,
      ...options
    }));
  return await gcloud<Brand[]>('iap oauth-brands list', {
    flags: { filter: `name=projects/${projectNumber}/brands/${projectNumber}` }
  });
}
