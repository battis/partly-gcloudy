import * as lib from '#lib';
import { gcloud } from '#shell';
import { active } from '../active.js';
import { describe } from '../describe.js';
import { Project } from '../Project.js';
import { inputName } from './inputName.js';
import { inputProjectId } from './inputProjectId.js';

type Options = {
  name?: string;
  defaultName?: string;
  /** @deprecated Use 'projectId' */
  id?: string;
  projectId?: string;
  reuseIfExists?: boolean;
};

export async function create({
  id,
  name,
  defaultName,
  projectId,
  reuseIfExists
}: Options = {}) {
  name = await inputName({ name, default: defaultName });
  projectId = await inputProjectId({ projectId: projectId || id });
  let project: Project | undefined;
  if (projectId) {
    project = active.get();
    if (projectId !== project?.projectId) {
      project = await describe({ projectId });
    }
    if (project && reuseIfExists === undefined) {
      reuseIfExists = !!(await lib.prompts.confirm.reuse<Project>({
        arg: reuseIfExists,
        instance: project,
        argDescription: 'Google Cloud project',
        name: projectId
      }));
    }
  }
  if (!project || reuseIfExists === false) {
    project = await gcloud<Project>(
      `projects create ${await inputProjectId({
        projectId,
        validate:
          project &&
          lib.validators.exclude({ exclude: project, property: 'name' })
      })}`,
      {
        flags: { name },
        includeProjectIdFlag: false
      }
    );
    if (project == null) {
      throw new Error('Failed to create project');
    }
  }
  active.activate(project);
  return project;
}
