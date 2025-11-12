import * as lib from '../lib/index.js';
import * as shell from '../shell/index.js';
import { Project } from './Project.js';
import { active } from './active.js';
import { inputProjectId } from './create.js';

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
