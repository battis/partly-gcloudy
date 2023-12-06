import cli from '@battis/qui-cli';
import * as core from '../core';
import * as projects from '../projects';
import * as app from '../app';
import * as billing from '../billing';
import ConditionalEnvFile from './ConditionalEnvFile';

export type EnvFile =
  | ConditionalEnvFile
  | {
      keys: { idVar?: string; urlVar?: string };
    };

export type PreBuildCallback = (args: {
  project: projects.Project;
  appEngine: app.AppEngine;
}) => boolean;

export default async function appEnginePublish({
  name,
  id = projects.active.get()?.projectId,
  suggestedName,
  billingAccountId,
  region,
  env = true,
  preBuild,
  build,
  deploy = true
}: {
  name?: string;
  suggestedName?: string;
  id?: string;
  billingAccountId?: string;
  region?: string;
  env?: EnvFile;
  preBuild?: PreBuildCallback;
  build?: string;
  deploy?: boolean;
} = {}) {
  const args = await core.init();
  if (core.ready()) {
    const {
      idVar = args.values.projectEnvVar,
      urlVar = `${args.values.projectEnvVar}_URL`
    } = typeof env === 'boolean' || typeof env === 'string' ? {} : env.keys;

    if (core.ready()) {
      // create new project (or reuse existing)
      if (!name && suggestedName) {
        name = await projects.inputName({ default: suggestedName });
      }
      const project = await projects.create({
        name,
        id
      });
      id = project.projectId;

      // enable billing to allow enabling services later
      await billing.projects.enable({ account: billingAccountId });

      // enable App Engine for the project and update .env
      const appEngine = await app.create({ region });
      const url = `https://${appEngine.defaultHostname}`;
      if (env) {
        cli.env.set({
          key: idVar,
          value: project.projectId,
          comment: cli.env.exists({ key: idVar })
            ? undefined
            : 'Google Cloud Project'
        });
        cli.env.set({ key: urlVar, value: url });
      }

      if (preBuild) {
        if (!preBuild({ project, appEngine })) {
          throw new Error('Pre-build callback failed');
        }
      }

      if (build) {
        cli.shell.exec(build);
      }
      if (deploy) {
        await app.deploy();
      }
      return { project, appEngine };
    }
    return false;
  }
}
