import cli from '@battis/qui-cli';
import * as lib from '../lib';
import * as shell from '../shell';
import Project from './Project';
import active from './active';

export type ProjectId = string;

export type Name = string;

export { type Project };

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
    validate: cli.validators.combine(
      validate,
      cli.validators.lengthBetween(6, 30)
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
    validate: cli.validators.combine(
      validate,
      cli.validators.lengthBetween(6, 30)
    ),
    ...rest
  });
}

export async function describe({ projectId }: { projectId?: string } = {}) {
  return await shell.gcloud<Project, lib.Undefined.Value>(
    `projects describe ${await inputProjectId({
      projectId: projectId || active.get()?.projectId
    })}`,
    {
      includeProjectIdFlag: false,
      error: lib.Undefined.callback
    }
  );
}

export async function list() {
  return await shell.gcloud<Project[]>('projects list', {
    includeProjectIdFlag: false
  });
}

export async function selectProjectId({
  projectId,
  activate = true,
  ...rest
}: Partial<lib.prompts.select.Parameters<Project>> &
  Partial<Parameters<typeof create>[0]> & {
    projectId?: string;
    activate?: boolean;
  } = {}) {
  return await lib.prompts.select<Project>({
    arg: projectId || active.get()?.projectId,
    argTransform: async (id?: string) => {
      if (id === active.get()?.projectId) {
        return active.get() as Project;
      }
      return await describe({ projectId });
    },
    message: 'Google Cloud project',
    choices: async () =>
      (
        await list()
      ).map((p) => ({
        name: p.name,
        value: p,
        description: p.projectId
      })),
    transform: (p: Project) => p.projectId,
    active: activate ? active : undefined,
    create: async (projectId?: string) => await create({ projectId }),
    ...rest
  });
}

export const selectIdentifier = selectProjectId;

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
    argTransform: async (projectNumber) => {
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
      (
        await list()
      ).map((p) => ({
        name: p.name,
        value: p,
        description: p.projectNumber
      })),
    transform: (p: Project) => p.projectNumber,
    active: activate ? active : undefined,
    ...rest
  });
}

export async function selectProject({
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
    active: activate ? active : undefined
  });
}

export { active };

/** @deprecated use {@link active} */
export const id = active;

export async function create({
  id,
  name,
  projectId,
  reuseIfExists
}: {
  name?: string;
  /** @deprecated use `projectId` */
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
