type AppEngine = {
  authDomain: string;
  codeBucket: string;
  databaseType: string;
  defaultBucket: string;
  defaultHostname: string;
  featureSettings: {
    splitHealthChecks: boolean;
    useContainerOptimizedOs: boolean;
  };
  gcrDomain: string;
  iap: {
    enable: boolean;
    oauth2ClientId: string;
    oauth2ClientSecretSha256: string;
  };
  id: string;
  locationId: string;
  name: string;
  serviceAccount: string;
  servingStatus: string;
};

export type { AppEngine as default };
