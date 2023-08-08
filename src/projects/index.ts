import cli from '@battis/qui-cli';
import lib from '../lib';
import shell from '../shell';
import TProject from './Project';
import active from './active';

class projects {
  protected constructor() {
    // ignore
  }

  public static async inputProjectId({
    projectId,
    validate,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input<projects.ProjectId>>[0]> & {
    projectId?: string;
  } = undefined) {
    return await lib.prompts.input<projects.ProjectId>({
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

  public static async inputName({
    name,
    validate,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input<projects.Name>>[0]> & {
    name?: string;
  } = undefined) {
    return await lib.prompts.input<projects.Name>({
      arg: name,
      message: 'Google Cloud project name',
      validate: cli.validators.combine(
        validate,
        cli.validators.lengthBetween(6, 30)
      ),
      ...rest
    });
  }

  public static async describe({
    projectId
  }: { projectId?: string } = undefined) {
    return shell.gcloud<projects.Project>(
      `projects describe ${await this.inputProjectId({
        projectId: projectId || active.get().projectId
      })}`,
      {
        includeProjectIdFlag: false
      }
    );
  }

  public static list = () =>
    shell.gcloud<projects.Project[]>('projects list', {
      includeProjectIdFlag: false
    });

  public static async selectProjectId({
    projectId,
    activate,
    ...rest
  }: Partial<lib.prompts.select.Parameters.ValueToString<projects.Project>> &
    Partial<Parameters<typeof this.create>[0]> & {
      projectId?: string;
    } = undefined) {
    return await lib.prompts.select<projects.Project>({
      arg: projectId,
      message: 'Google Cloud project',
      choices: () =>
        this.list().map((p: projects.Project) => ({
          name: p.name,
          value: p,
          description: p.projectId
        })),
      transform: (p: projects.Project) => p.projectId,
      activate: activate && this.active,
      create: this.create,
      ...rest
    });
  }

  public static selectIdentifier = this.selectProjectId;

  public static async selectProjectNumber({
    projectNumber,
    activate,
    ...rest
  }: Partial<lib.prompts.select.Parameters.ValueToString<projects.Project>> &
    Partial<Parameters<typeof this.create>[0]> & {
      projectNumber?: string | number;
    } = undefined) {
    return await lib.prompts.select({
      arg: projectNumber.toString() || this.active.get().projectNumber,
      message: 'Google Cloud project',
      choices: () =>
        this.list().map((p) => ({
          name: p.name,
          value: p,
          description: p.projectNumber
        })),
      transform: (p: projects.Project) => p.projectId,
      activate: activate && this.active,
      create: this.create,
      ...rest
    });
  }

  public static async selectProject({
    project = this.active.get(),
    activate,
    ...rest
  }: Partial<
    lib.prompts.select.Parameters.ValueToValue<
      projects.Project,
      projects.Project
    >
  > &
    Partial<Parameters<typeof this.create>[0]> & {
      project?: projects.Project;
    } = undefined) {
    return lib.prompts.select<projects.Project, projects.Project>({
      arg: project?.projectId,
      argTransform: () => project,
      validate: false,
      message: 'Google Cloud project',
      choices: () =>
        this.list().map((p) => ({
          name: p.name,
          value: p,
          description: p.projectId
        })),
      transform: (p: projects.Project) => p,
      activate: activate && this.active,
      create: this.create,
      ...rest
    });
  }

  public static active = active;

  /** @deprecated use {@link active} */
  public static id = this.active;

  public static async create({
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
  } = undefined) {
    name = await this.inputName({ name });
    projectId = await this.inputProjectId({ projectId: projectId || id });
    let project =
      projectId &&
      (await lib.prompts.confirm.reuse<projects.Project>({
        arg: reuseIfExists,
        instance: await this.describe({ projectId }),
        argDescription: 'Google Cloud project',
        name: projectId
      }));

    if (!project || reuseIfExists === false) {
      project = shell.gcloud<projects.Project>(
        `projects create --name=${lib.prompts.escape(name)} ${projectId}`,
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
}

namespace projects {
  export type ProjectId = string;
  export type Name = string;
  export type Project = TProject;
}

export { projects as default };
