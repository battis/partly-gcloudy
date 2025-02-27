import { Env } from '@battis/qui-cli.env';
import { Shell } from '@battis/qui-cli.shell';
import * as app from '../app.js';
import * as billing from '../billing.js';
import * as core from '../core.js';
import * as projects from '../projects.js';
import ConditionalEnvFile from './ConditionalEnvFile.js';

type EnvFile =
  | ConditionalEnvFile
  | {
      keys: { idVar?: string; urlVar?: string };
    };

export type PreBuildCallback = (args: {
  project: projects.Project;
  appEngine: app.AppEngine;
}) => boolean;

export async function appEnginePublish({
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
  const args = core.args();
  console.log({ args });
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
      await billing.projects.enable({
        account: billingAccountId,
        projectId: id
      });

      // enable App Engine for the project and update .env
      const appEngine = await app.create({ region });
      const url = `https://${appEngine.defaultHostname}`;
      if (env) {
        Env.set({
          key: idVar,
          value: project.projectId,
          comment: Env.exists({ key: idVar })
            ? undefined
            : 'Google Cloud Project'
        });
        Env.set({ key: urlVar, value: url });
      }

      if (preBuild) {
        if (!preBuild({ project, appEngine })) {
          throw new Error('Pre-build callback failed');
        }
      }

      if (build) {
        Shell.exec(build);
      }
      let deployment;
      if (deploy) {
        deployment = await app.deploy();
      }
      return { project, appEngine, deployment };
    }
    return false;
  }
}
