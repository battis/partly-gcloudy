import * as lib from '#lib';
import { gcloud } from '#shell';
import { Project } from './Project.js';
import { active } from './active.js';
import { inputProjectId } from './create/inputProjectId.js';

type Options = {
  projectId?: string;
};

export async function describe({ projectId }: Options = {}) {
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
