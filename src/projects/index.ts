import cli from '@battis/qui-cli';
import lib from '../lib';
import { InputConfig } from '../lib/prompts/input';
import shell from '../shell';
import active, { Project } from './active';

type CreateOptions = {
  name: string;
  /** @deprecated use {@link CreateOptions.projectId} */
  id: string;
  projectId: string;
  reuseIfExists: boolean;
};

type InputIdentifierOptions = Partial<InputConfig> & {
  projectId?: string;
};

async function inputIdentifier(options?: InputIdentifierOptions) {
  const { projectId, ...rest } = options;
  return (
    projectId ||
    (await cli.prompts.input({
      message: 'Google Cloud project unique identifier',
      validate: cli.validators.lengthBetween(6, 30),
      default: lib.generate.projectId(),
      ...rest
    }))
  );
}

type InputNameOptions = Partial<InputConfig> & {
  name?: string;
};

async function inputName(options?: InputNameOptions) {
  const { name, ...rest } = options;
  return (
    name ||
    (await cli.prompts.input({
      message: 'Google Cloud project name',
      validate: cli.validators.lengthBetween(6, 30),
      ...rest
    }))
  );
}
const describe = async (projectId?: string) =>
  shell.gcloud<Project>(
    `projects describe ${await inputIdentifier({
      projectId: projectId || active.get()
    })}`,
    {
      includeProjectIdFlag: false
    }
  );

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

  create: async function({
    name,
    id,
    projectId,
    reuseIfExists
  }: Partial<CreateOptions>) {
    name = await inputName({ name });
    projectId = await inputIdentifier({ projectId: projectId || id });
    let project =
      projectId &&
      (await lib.prompts.confirm.reuse<Project>({
        description: 'Google Cloud project',
        reuse: reuseIfExists,
        instance: await describe(projectId),
        name: projectId
      }));

    if (!project || reuseIfExists === false) {
      project = shell.gcloud<Project>(
        `projects create --name="${name}" ${projectId}`,
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
