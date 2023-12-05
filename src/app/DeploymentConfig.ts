type File = {
  [fileName: string]: {
    mimeType?: string;
    sha1Sum: string;
    sourceUrl: string;
  };
};

type Handler = {
  authFailAction: string;
  login: string;
  securityLevel?: string;
  staticFiles?: {
    expiration: string;
    path: string;
    uploadPathRegex: string;
  };
  script?: {
    scriptPath: string;
  };
  urlRegex: string;
};

type Version = {
  environment: string;
  id: string;
  last_deployed_time: string;
  project: string;
  service: string;
  service_account: string;
  traffic_split: string;
  version: {
    appEngineApis: boolean;
    basicScaling: {
      idleTimeout: string;
      maxInstances: number;
    };
    createTime: string;
    createdBy: string;
    deployment: {
      files: File[];
    };
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
};

type DeploymentConfig = {
  configs: any[];
  versions: Version[];
};

export default DeploymentConfig;
