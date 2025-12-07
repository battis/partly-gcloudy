import * as app from '../../app/index.js';
import * as projects from '../../projects/index.js';
import { initialize } from './initialize.js';

/**
 * Deploy a new Google App Engine version
 *
 * If not already enabled and initialized, this will guide the user through
 * enabling and initializing Gooel App Engine for the current project. If no
 * project has been created, that will also be included in the wizard.
 *
 * Optionally, this can be configured to only retain _n_ recent versions of the
 * App Engine instance, reducing storage use.
 *
 * @returns Descriptors of the project, appEngine instance, and most recent
 *   deployment
 */
export async function deploy({
  retainVersions,
  ...options
}: Partial<Parameters<typeof initialize>>[0] & {
  retainVersions?: number;
} = {}) {
  let appEngine: app.AppEngine | undefined = undefined;
  let project: projects.Project | undefined = undefined;
  let deployment: app.DeploymentConfig | undefined = undefined;
  if (!projects.active.get()) {
    const result = await initialize(options);
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
