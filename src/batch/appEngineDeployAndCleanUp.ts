import * as app from '../app.js';
import * as core from '../core.js';
import * as projects from '../projects.js';
import { appEnginePublish, PreBuildCallback } from './appEnginePublish.js';

export async function appEngineDeployAndCleanup({
  retainVersions,
  ...options
}: Partial<Parameters<typeof appEnginePublish>>[0] & {
  retainVersions?: number;
} = {}) {
  if (core.ready()) {
    let activeVersion: app.DeploymentConfig | undefined = undefined;
    if (!projects.active.get()) {
      const result = await appEnginePublish(options);
      if (result) {
        activeVersion = result?.deployment;
      }
    } else {
      activeVersion = await app.deploy();
    }
    if (activeVersion) {
      if (retainVersions !== undefined && retainVersions > 0) {
        const versions = await app.versions.list();
        for (let i = retainVersions; i < versions.length; i++) {
          if (versions[i].id !== activeVersion?.versions[0].id)
            app.versions.delete_({ version: versions[i].id });
        }
      }

      return { activeVersion };
    }
  }
  return false;
}
