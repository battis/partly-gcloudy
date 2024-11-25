export type Version = {
  environment: {
    name: string;
    value: number;
  };
  id: string;
  last_deployed_time: {
    datetime: string;
    day: number;
    fold: number;
    hour: number;
    microsecond: number;
    minute: number;
    month: number;
    second: number;
    year: number;
  };
  project: string;
  service: string;
  service_account: null | string;
  traffic_split: number;
  version: {
    appEngineApis: boolean;
    basicScaling: {
      idleTimeout: string;
      maxInstances: number;
    };
    createTime: string;
    createdBy: string;
    diskUsageBytes: string;
    env: string;
    id: string;
    instanceClass: string;
    name: string;
    network: object;
    runtime: string;
    runtimeChannel: string;
    serviceAccount: string;
    servingStatus: string;
    threadsafe: boolean;
    versionUrl: string;
  };
};
