import * as DefaultEnv from '@qui-cli/env/dist/Env.js';
import * as Plugin from '@qui-cli/plugin';
import { Shell } from '@qui-cli/shell';
import * as app from '../app/index.js';
import * as billing from '../billing/index.js';
import * as gcloud from '../gcloud.js';
import * as projects from '../projects/index.js';
import ConditionalEnvFile from './ConditionalEnvFile.js';

let Env = Plugin.Registrar.registered().find(
  (plugin) => plugin.name === DefaultEnv.name
) as typeof DefaultEnv;
if (!Env) {
  Env = DefaultEnv;
  Plugin.register(DefaultEnv);
}

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
  const args = gcloud.args();
  const {
    idVar = args.values.projectEnvVar,
    urlVar = `${args.values.projectEnvVar}_URL`
  } = typeof env === 'boolean' || typeof env === 'string' ? {} : env.keys;

  if (gcloud.ready()) {
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
      await Env.set({
        key: idVar,
        value: project.projectId,
        comment: (await Env.exists({ key: idVar }))
          ? undefined
          : 'Google Cloud Project'
      });
      await Env.set({ key: urlVar, value: url });
    }

    if (preBuild) {
      if (!preBuild({ project, appEngine })) {
        throw new Error('Pre-build callback failed');
      }
    }

    if (build) {
      Shell.exec(build);
    }

    await app.describe();

    let deployment;
    if (deploy) {
      deployment = await app.deploy();
    }
    return { project, appEngine, deployment };
  }
  return false;
}
