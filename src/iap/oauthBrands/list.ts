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
    (await projects.selectProjectNumber({ projectNumber }));
  return await shell.gcloud<Brand[]>(
    `iap oauth-brands list --filter=name=projects/${projectNumber}/brands/${projectNumber}`
  );
}
