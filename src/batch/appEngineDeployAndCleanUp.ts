import * as app from '../app';
import * as core from '../core';
import * as projects from '../projects';
import { PreBuildCallback } from './appEnginePublish';
import cli from '@battis/qui-cli';

export async function appEngineDeployAndCleanup({
  preBuild,
  build,
  retainVersions
}: {
  preBuild?: PreBuildCallback;
  build?: string;
  retainVersions?: number;
} = {}) {
  if (core.ready()) {
    const project = await projects.describe();
    const appEngine = await app.describe();
    if (project && appEngine && preBuild) {
      if (!preBuild({ project, appEngine })) {
        throw new Error('Pre-build callback failed');
      }
    }

    if (build) {
      cli.shell.exec(build);
    }

    const activeVersion = await app.deploy();
    if (retainVersions !== undefined && retainVersions > 0) {
      const versions = await app.versions.list();
      for (let i = retainVersions; i < versions.length; i++) {
        app.versions.delete_({ version: versions[i].id });
      }
    }

    return { activeVersion };
  }
  return false;
}
