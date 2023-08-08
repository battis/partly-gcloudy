type Service = {
  config: {
    authentication: Record<string, string>;
    documentation: Record<string, string>;
    monitoredResources: [{ labels: [{ key: string }]; type: string }];
    monitoring: {
      consumerDestinations: [{ metrics: string[]; monitoredResource: string }];
    };
    name: string;
    quota: Record<string, string>;
    title: string;
    usage: Record<string, string>;
  };
  name: string;
  parent: string;
  state: string;
};

export type { Service as default };
