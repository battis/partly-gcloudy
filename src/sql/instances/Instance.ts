export type Instance = {
  backendType: string;
  connectionName: string;
  createTime: string;
  databaseInstalledVersion: string;
  databaseVersion: string;
  etag: string;
  gceZone: string;
  instanceType: 'CLOUD_SQL_INSTANCE';
  ipAddresses: [
    {
      ipAddress: string;
      type: string;
    }
  ];
  kind: string;
  maintenanceVersion: string;
  name: string;
  project: string;
  region: string;
  selfLink: string;
  serverCaCert: {
    cert: string;
    certSerialNumber: string;
    commonName: string;
    createTime: string;
    expirationTime: string;
    instance: string;
    kind: string;
    sha1Fingerprint: string;
  };
  serviceAccountEmailAddress: string;
  settings: {
    activationPolicy: string;
    availabilityType: string;
    backupConfiguration: {
      backupRetentionSettings: {
        retainedBackups: number;
        retentionUnit: string;
      };
      enabled: boolean;
      kind: string;
      startTime: string;
      transactionLogRetentionDays: number;
    };
    connectorEnforcement: string;
    dataDiskSizeGb: string;
    dataDiskType: string;
    deletionProtectionEnabled: boolean;
    ipConfiguration: {
      ipv4Enabled: boolean;
    };
    kind: string;
    locationPreference: {
      kind: string;
      zone: string;
    };
    pricingPlan: string;
    replicationType: string;
    settingsVersion: string;
    storageAutoResize: boolean;
    storageAutoResizeLimit: string;
    tier: string;
  };
  state: string;
};
