import cli from '@battis/qui-cli';
import gcloud from '../index';
import ConditionalEnvFile from './ConditionalEnvFile';

type EnvFile =
  | ConditionalEnvFile
  | {
      keys: { idVar?: string; urlVar?: string };
    };

type PreBuildCallback = (args: {
  project: gcloud.projects.Project;
  appEngine: gcloud.app.AppEngine;
}) => boolean;

export default async function appEnginePublish({
  name,
  id = gcloud.projects.active.get()?.projectId,
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
  const args = await gcloud.init();
  if (gcloud.ready()) {
    const {
      idVar = args.values.projectEnvVar,
      urlVar = `${args.values.projectEnvVar}_URL`
    } = typeof env === 'boolean' || typeof env === 'string' ? {} : env.keys;

    if (gcloud.ready()) {
      // create new project (or reuse existing)
      if (!name && suggestedName) {
        name = await gcloud.projects.inputName({ default: suggestedName });
      }
      const project = await gcloud.projects.create({
        name,
        id
      });
      id = project.projectId;

      // enable billing to allow enabling services later
      await gcloud.billing.projects.enable({ account: billingAccountId });

      // enable App Engine for the project and update .env
      const appEngine = await gcloud.app.create({ region });
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
        gcloud.app.deploy();
      }
      return { project, appEngine };
    }
    return false;
  }
}
