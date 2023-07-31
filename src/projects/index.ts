import cli from '@battis/qui-cli';
import lib from '../lib';
import { InputOptions } from '../lib/prompts';
import shell from '../shell';
import active, { Project as ProjectInstance } from './active';

export type Project = ProjectInstance;

type CreateOptions = {
  name: string;
  /** @deprecated use {@link CreateOptions.projectId} */
  id: string;
  projectId: string;
  reuseIfExists: boolean;
};

type ProjectIdentifier = string;

type InputIdentifierOptions = Partial<InputOptions<ProjectIdentifier>> & {
  projectId?: string;
};

async function inputIdentifier(options?: InputIdentifierOptions) {
  const { projectId, ...rest } = options;
  return await lib.prompts.input<ProjectIdentifier>({
    arg: projectId,
    message: 'Google Cloud project unique identifier',
    validate: cli.validators.lengthBetween(6, 30),
    default: lib.generate.projectId(),
    ...rest
  });
}

type ProjectName = string;

type InputNameOptions = Partial<InputOptions<ProjectName>> & {
  name?: string;
};

async function inputName(options?: InputNameOptions) {
  const { name, ...rest } = options;
  return await lib.prompts.input<ProjectName>({
    arg: name,
    message: 'Google Cloud project name',
    validate: cli.validators.lengthBetween(6, 30),
    ...rest
  });
}

type DescribeOptions = { projectId?: string };

async function describe(options?: DescribeOptions) {
  const { projectId } = options;
  return shell.gcloud<Project>(
    `projects describe ${await inputIdentifier({
      projectId: projectId || active.get()
    })}`,
    {
      includeProjectIdFlag: false
    }
  );
}

const list = async () =>
  shell.gcloud<Project[]>('projects list', { includeProjectIdFlag: false });

export default {
  inputIdentifier,
  inputName,
  describe,
  list,

  /** @deprecated use {@link active} */
  id: active,
  active,

  create: async function(options?: Partial<CreateOptions>) {
    const { id, reuseIfExists } = options;
    let { name, projectId } = options;
    name = await inputName({ name });
    projectId = await inputIdentifier({ projectId: projectId || id });
    let project =
      projectId &&
      (await lib.prompts.confirmReuse<Project>({
        description: 'Google Cloud project',
        reuse: reuseIfExists,
        instance: await describe({ projectId }),
        name: projectId
      }));

    if (!project || reuseIfExists === false) {
      project = shell.gcloud<Project>(
        `projects create --name=${lib.prompts.escape(name)} ${projectId}`,
        {
          includeProjectIdFlag: false
        }
      );
      if (project == null) {
        throw new Error(`Failed to create project`);
      }
    }
    active.set(project.projectId, project);
    return project;
  }
};
