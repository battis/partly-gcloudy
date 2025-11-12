import * as projects from '../../projects/index.js';
import * as shell from '../../shell/index.js';
import { Brand } from './Brand.js';

export async function list({
  project,
  projectNumber
}: { project?: projects.Project; projectNumber?: number | string } = {}) {
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
            await shell.gcloud<projects.Project[]>(
              `projects list --filter=projectNumber=${projectNumber}`
            )
          ).shift();
        }
      },
      transform: (p: projects.Project) => p.projectNumber
    }));
  return await shell.gcloud<Brand[]>(
    `iap oauth-brands list --filter=name=projects/${projectNumber}/brands/${projectNumber}`
  );
}
