import * as lib from '#lib';
import { gcloud } from '#shell';
import { Project } from './Project.js';
import { active } from './active.js';
import { inputProjectId } from './create.js';

export async function describe({ projectId }: { projectId?: string } = {}) {
  return await gcloud<Project, lib.Undefined.Value>(
    `projects describe ${await inputProjectId({
      projectId: projectId || active.get()?.projectId
    })}`,
    {
      includeProjectIdFlag: false,
      error: lib.Undefined.callback
    }
  );
}
