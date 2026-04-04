import * as app from '#app';
import * as core from '#core';
import * as projects from '#projects';
import { PathString } from '@battis/descriptive-types';
import { Env } from '@qui-cli/env';
import { Shell } from '@qui-cli/shell';
import * as iam from '../iam/index.js';
import { filePathFrom } from '../lib/filePathFrom.js';
import * as batchProjects from '../projects/index.js';

export type PreBuildCallback = (args: {
  project: projects.Project;
  appEngine: app.AppEngine;
}) => boolean;

type Options = {
  region?: string;
  secretsAccess?: iam.AccessLevel;
  env?: true | PathString;
  preBuild?: PreBuildCallback;
  build?: string;
  deploy?: boolean;
} & Parameters<typeof batchProjects.initialize>[0];

/**
 * Initialize a new instance of Google App Engine
 *
 * @returns Descriptors of the project, appEngine instance, and most recent
 *   deployment
 */
export async function initialize({
  region,
  secretsAccess,
  env = true,
  preBuild,
  build,
  deploy = true,
  ...options
}: Options = {}) {
  const urlEnvVar = `${core.args().values.projectEnvVar}_URL`;

  const { project } = await batchProjects.initialize(options);

  // enable App Engine for the project and update .env
  const appEngine = await app.create({ region });
  const url = `https://${appEngine.defaultHostname}`;
  if (env) {
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

  // necessary to get app "ready" for deployment
  await app.describe();

  let deployment;
  if (deploy) {
    deployment = await app.deploy();
  }

  if (secretsAccess) {
    iam.enableServiceAccountSecretsAccess({
      serviceAccount: appEngine.serviceAccount,
      accessLevel: secretsAccess
    });
  }
  return { project, appEngine, deployment };
}
