import * as billing from '#billing';
import * as core from '#core';
import * as projects from '#projects';

export async function initialize({
  name,
  defaultName,
  suggestedName,
  projectId = projects.active.get()?.projectId,
  env = true,
  billingAccountId
}: initialize.Options = {}) {
  const project = await projects.create({
    name,
    defaultName: defaultName || suggestedName,
    id: projectId
  });
  projectId = project.projectId;
  if (env) {
    core.writeEnv({ projectId });
  }
  if (billingAccountId) {
    await billing.projects.enable({
      account: billingAccountId === true ? undefined : billingAccountId,
      projectId
    });
  }
  return { project };
}

export namespace initialize {
  export type Options = {
    name?: string;
    defaultName?: string;
    /** @deprecated Use {$link defaultName} */
    suggestedName?: string;
    projectId?: string;
    env?: true | string;
    billingAccountId?: true | string;
  };
}
