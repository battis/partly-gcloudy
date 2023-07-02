import cli from '@battis/qui-cli';
import { Nullable } from '@battis/typescript-tricks';
import services from './services';
import shell from './shell';

type CreateOptions = {
  region: string;
};

type Instance = {
  authDomain: string;
  codeBucket: string;
  databaseType: string;
  defaultBucket: string;
  defaultHostname: string;
  featureSettings: {
    splitHealthChecks: boolean;
    useContainerOptimizedOs: true;
  };
  gcrDomain: string;
  iap: {
    enable: boolean;
    oauth2ClientId: string;
    oauth2ClientSecretSha256: string;
  };
  id: string;
  locationid: string;
  name: string;
  serviceAccount: string;
  servingStatus: string;
};

async function describe() {
  return shell.gcloud<Instance>('app describe');
}

async function create({ region }: Partial<CreateOptions>) {
  services.enable({ service: services.API.AppEngineAdminAPI });
  let instance = await describe();
  if (instance == null) {
    const response = shell.gcloud(`app regions list`);
    let choices;
    if (Array.isArray(response)) {
      choices = response.map((region) => ({
        value: region.region
      }));
    } else {
      throw new Error(`Unexpected response: ${response}`);
    }
    region =
      region ||
      (await cli.prompts.select({
        message: 'Google Cloud region in which to create App Engine instance',
        choices
      }));
    shell.gcloud(`app create --region=${region}`);
    instance = await describe();
  }

  return instance;
}

type DeploymentFile = {
  [fileName: string]: {
    mimeType?: string;
    sha1Sum: string;
    sourceUrl: string;
  };
};

type Deployment = {
  files: DeploymentFile[];
};

type StaticFiles = {
  expiration: string;
  path: string;
  uploadPathRegex: string;
};

type Handler = {
  authFailAction: string;
  login: string;
  securityLevel?: string;
  staticFiles?: StaticFiles;
  script?: {
    scriptPath: string;
  };
  urlRegex: string;
};

type Version = {
  appEngineApis: boolean;
  basicScaling: {
    idleTimeout: string;
    maxInstances: number;
  };
  createTime: string;
  createdBy: string;
  deployment: Deployment;
  diskUsageBytes: string;
  env: string;
  handlers: Handler[];
  id: string;
  instanceClass: string;
  name: string;
  network: any;
  runtime: string;
  runtimeChannel: string;
  serviceAccount: string;
  servingStatus: string;
  threadsafe: boolean;
  versionUrl: string;
};

type DeploymentVersion = {
  environment: Nullable<string>;
  id: string;
  last_deployed_time: Nullable<string>;
  project: string;
  service: string;
  service_account: Nullable<string>;
  traffic_split: Nullable<string>;
  version: Version;
};

type DeployResponse = {
  configs: any[];
  versions: DeploymentVersion[];
};

async function deploy() {
  return shell.gcloud<DeployResponse>('app deploy');
}

async function logs() {
  shell.gcloud('app logs tail -s default', {
    overrideBaseFlags: true,
    flags: { format: 'text' }
  });
}

export default { create, describe, deploy, logs };
