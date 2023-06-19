import cli from '@battis/cli';
import { rword } from 'rword';
import invoke from './invoke';

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

export function generateId() {
  const word1 = rword.generate(1, {
    length: 4 + Math.floor(Math.random() * 7)
  });
  const word2 = rword.generate(1, {
    length: 4 + Math.floor(Math.random() * (30 - 8 - word1.length - 4))
  });
  return `${word1}-${word2}-${Math.floor(99999 + Math.random() * 900001)}`;
}

let id = generateId();

export const getId = () => id;
export const setId = (newId: string) => (id = newId);

export async function create({ name, id, defaults }: Partial<CreateOptions>) {
  name =
    name ||
    (await cli.io.prompts.input({
      message: 'Google Cloud project name',
      validate: cli.io.validators.lengthBetween(6, 30),
      default: defaults?.name || ''
    }));
  setId(
    id ||
    (await cli.io.prompts.input({
      message: 'Google Cloud project unique identifier',
      validate: cli.io.validators.lengthBetween(6, 30),
      default: generateId()
    }))
  );
  const list = await invoke<Project[]>(
    `projects list --filter=projectId=${getId()}`
  );
  let project;
  if (list != null) {
    [project] = list;
  }
  if (project) {
    if (
      !(await cli.io.prompts.confirm({
        message: `'(Re)configure existing project' ${cli.io.value(
          project.projectId
        )}?`
      }))
    ) {
      throw new Error('must create or reuse project');
    }
  } else {
    const project = await invoke<Project>(
      `projects create --name="${name}" ${getId()}`,
      {
        includeProjectIdFlag: false
      }
    );
    if (project == null) {
      throw new Error('Failed to create project');
    }
  }
  return project;
}

export async function describe() {
  return await invoke<Project>(`projects describe ${getId()}`);
}
