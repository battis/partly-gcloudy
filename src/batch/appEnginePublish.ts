import cli from '@battis/qui-cli';
import { AppEngine } from '../app';
import gcloud from '../index';
import { Project } from '../projects';

type PreBuildCallbackArguments = {
  project: Project;
  appEngine: AppEngine;
};
type PreBuildCallback = (args: PreBuildCallbackArguments) => boolean;

type AppEnginePublishOptions = {
  name?: string;
  suggestedName?: string;
  id?: string;
  billingAccountId: string;
  region?: string;
  env?:
  | boolean
  | {
    idVar?: string;
    urlVar?: string;
  };
  preBuild?: PreBuildCallback;
  build: string;
};

export default async function appEnginePublish(
  options?: AppEnginePublishOptions
) {
  const args = gcloud.init();
  if (gcloud.ready()) {
    let { name, id = gcloud.projects.active.get() } = options;
    const {
      suggestedName,
      billingAccountId,
      region,
      env = true,
      preBuild,
      build = 'npm run build'
    } = options;

    const {
      idVar = args.values.projectEnvVar,
      urlVar = `${args.values.projectEnvVar}_URL`
    } = typeof env === 'boolean' ? {} : env;

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
      await gcloud.billing.enable({ accountId: billingAccountId });

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
      gcloud.app.deploy();
      return { project, appEngine };
    }
    return false;
  }
}
