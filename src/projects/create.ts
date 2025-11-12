import { Validators } from '@qui-cli/validators';
import * as lib from '../lib/index.js';
import * as shell from '../shell/index.js';
import { Project } from './Project.js';
import { active } from './active.js';
import { describe } from './describe.js';

type ProjectId = string;
type Name = string;

export async function inputProjectId({
  projectId,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<ProjectId>>[0]> & {
  projectId?: string;
} = {}) {
  return await lib.prompts.input<ProjectId>({
    arg: projectId,
    message: 'Google Cloud project unique identifier',
    validate: Validators.combine(
      validate || (() => true),
      Validators.lengthBetween(6, 30)
    ),
    default: lib.generate.projectId(),
    ...rest
  });
}

export async function inputName({
  name,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<Name>>[0]> & {
  name?: string;
} = {}) {
  return await lib.prompts.input<Name>({
    arg: name,
    message: 'Google Cloud project name',
    validate: Validators.combine(
      validate || (() => true),
      Validators.lengthBetween(6, 30)
    ),
    ...rest
  });
}

export async function create({
  id,
  name,
  projectId,
  reuseIfExists
}: {
  name?: string;
  /** @deprecated Use `projectId` */
  id?: string;
  projectId?: string;
  reuseIfExists?: boolean;
} = {}) {
  name = await inputName({ name });
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
    project = await shell.gcloud<Project>(
      `projects create --name=${lib.prompts.escape(
        name
      )} ${await inputProjectId({
        projectId,
        validate:
          project &&
          lib.validators.exclude({ exclude: project, property: 'name' })
      })}`,
      {
        includeProjectIdFlag: false
      }
    );
    if (project == null) {
      throw new Error(`Failed to create project`);
    }
  }
  active.activate(project);
  return project;
}
