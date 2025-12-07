import { PathString } from '@battis/descriptive-types';
import { Env } from '@qui-cli/env-1password';
import { Shell } from '@qui-cli/shell';
import * as app from '../../app/index.js';
import * as billing from '../../billing/index.js';
import * as gcloud from '../../gcloud.js';
import * as projects from '../../projects/index.js';
import { filePathFrom } from '../lib/filePathFrom.js';

export type PreBuildCallback = (args: {
  project: projects.Project;
  appEngine: app.AppEngine;
}) => boolean;

type Options = {
  name?: string;
  defaultName?: string;
  suggestedName?: string;
  id?: string;
  billingAccountId?: string;
  region?: string;
  env?: true | PathString;
  preBuild?: PreBuildCallback;
  build?: string;
  deploy?: boolean;
};

/**
 * Initialize a new instance of Google App Engine
 *
 * @returns Descriptors of the project, appEngine instance, and most recent
 *   deployment
 */
export async function initialize({
  name,
  id = projects.active.get()?.projectId,
  defaultName,
  /** @deprecated Use defaultName */
  suggestedName,
  billingAccountId,
  region,
  env = true,
  preBuild,
  build,
  deploy = true
}: Options = {}) {
  const args = gcloud.args();
  const projectEnvVar = args.values.projectEnvVar;
  const urlEnvVar = `${projectEnvVar}_URL`;

  if (gcloud.ready()) {
    const project = await projects.create({
      name,
      defaultName: defaultName || suggestedName,
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
      if (typeof env === 'string') {
        Env.parse(env);
      }
      await Env.set({
        key: projectEnvVar,
        value: project.projectId,
        comment: (await Env.get({ key: projectEnvVar, ...filePathFrom(env) }))
          ? undefined
          : 'Google Cloud Project',
        ...filePathFrom(env)
      });
      await Env.set({ key: urlEnvVar, value: url, ...filePathFrom(env) });
    }
    await app.update({ sslPolicy: 'TLS_VERSION_1_2' });

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
