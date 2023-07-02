import cli from '@battis/qui-cli';
import shell from '../shell';
import id from './id';

type CreateDefaults = {
  name: string;
};

type CreateOptions = {
  name: string;
  id: string;
  defaults: Partial<CreateDefaults>;
};

type Project = {
  createTime: string;
  lifecycleState: string;
  name: string;
  parent: {
    id: string;
    type: string;
  };
  projectId: string;
  projectNumber: string;
};

export default {
  create: async function({
    name,
    id: idArg,
    defaults
  }: Partial<CreateOptions>) {
    name =
      name ||
      (await cli.prompts.input({
        message: 'Google Cloud project name',
        validate: cli.validators.lengthBetween(6, 30),
        default: defaults?.name || ''
      }));
    id.set(
      idArg ||
      (await cli.prompts.input({
        message: 'Google Cloud project unique identifier',
        validate: cli.validators.lengthBetween(6, 30),
        default: id.generate()
      }))
    );
    const list = shell.gcloud<Project[]>(
      `projects list --filter=projectId=${id.get()} --limit=1`,
      { includeProjectIdFlag: false }
    );
    let project;
    if (list != null) {
      [project] = list;
    }
    if (project) {
      if (
        !(await cli.prompts.confirm({
          message: `Reuse existing project ${cli.colors.value(
            project.projectId
          )}?`
        }))
      ) {
        throw new Error('must create or reuse project');
      }
    } else {
      project = shell.gcloud<Project>(
        `projects create --name="${name}" ${id.get()}`,
        {
          includeProjectIdFlag: false
        }
      );
      if (project == null) {
        throw new Error('Failed to create project');
      }
    }
    return project;
  },

  describe: async function() {
    return shell.gcloud<Project>(`projects describe ${id.get()}`, {
      includeProjectIdFlag: false
    });
  },

  id
};
