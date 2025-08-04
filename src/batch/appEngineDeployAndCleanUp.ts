import * as DefaultEnv from '@qui-cli/env/dist/Env.js';
import * as Plugin from '@qui-cli/plugin';
import * as app from '../app/index.js';
import * as projects from '../projects/index.js';
import { appEnginePublish } from './appEnginePublish.js';

let Env = Plugin.Registrar.registered().find(
  (plugin) => plugin.name === DefaultEnv.name
) as typeof DefaultEnv;
if (!Env) {
  Env = DefaultEnv;
  Plugin.register(DefaultEnv);
}

export async function appEngineDeployAndCleanup({
  retainVersions,
  ...options
}: Partial<Parameters<typeof appEnginePublish>>[0] & {
  retainVersions?: number;
} = {}) {
  let appEngine: app.AppEngine | undefined = undefined;
  let project: projects.Project | undefined = undefined;
  let deployment: app.DeploymentConfig | undefined = undefined;
  if (!projects.active.get()) {
    const result = await appEnginePublish(options);
    if (result) {
      project = result.project;
      appEngine = result.appEngine;
      deployment = result.deployment;
    }
  } else {
    project = await projects.active.get();
    appEngine = await app.describe();
    deployment = await app.deploy();
  }
  if (deployment) {
    if (retainVersions !== undefined && retainVersions > 0) {
      const versions = await app.versions.list();
      for (let i = retainVersions; i < versions.length; i++) {
        if (versions[i].id !== deployment.versions[0].id)
          app.versions.delete_({ version: versions[i].id });
      }
    }
  }
  return { project, appEngine, deployment };
}
