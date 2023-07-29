import { Nullable } from '@battis/typescript-tricks';

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

export type DeployResponse = {
  configs: any[];
  versions: DeploymentVersion[];
};
