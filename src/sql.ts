import cli from '@battis/qui-cli';
import app from './app';
import { Choice } from './inquirer';
import project from './project';
import services from './services';
import shell from './shell';

type CreateOptions = {
  instanceName: string;
  region: string;
  tier: string;
  databaseVersion: string;
  edition: string;
  cpu: number;
  memory: string;
};

type Instance = {
  backendType: string;
  connectionName: string;
  createTime: string;
  databaseInstalledVersion: string;
  databaseVersion: string;
  etag: string;
  gceZone: string;
  instanceType: 'CLOUD_SQL_INSTANCE';
  string: [
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

type Tier = {
  DiskQuota: string;
  RAM: string;
  kind: string;
  region: string[];
  tier: string;
};

async function list() {
  return shell.gcloud<Instance[]>('sql instances list');
}

async function tiersList() {
  return shell.gcloud<Tier[]>('sql tiers list');
}

async function tiersListForCliPromptsSelect(): Promise<Choice<string>[]> {
  return (await tiersList()).map((tier) => ({ value: tier.tier }));
}

export default {
  list,

  create: async function({
    instanceName,
    region,
    tier
  }: Partial<CreateOptions>) {
    services.enable({ service: services.API.CloudSQLAdminAPI });
    const instance =
      (await list()).filter((instance) => instance.name === instanceName)[0] ||
      null;
    if (instance) {
      if (
        await cli.prompts.confirm({
          message: `Reuse existing instance ${cli.colors.value(instanceName)}`
        })
      ) {
        return instance;
      }
    }
    region =
      region ||
      (await cli.prompts.select({
        message: 'Google Cloud region in qhich to create Cloud SQL instance',
        choices: await app.regionsListForCliPromptSelect() // TODO apparently no way to list available Cloud SQL regions at the moment https://cloud.google.com/sql/docs/instance-locations
      }));
    instanceName =
      instanceName ||
      (await cli.prompts.input({
        message: 'Cloud SQL instance name',
        validate: (value?: string) =>
          (!!value &&
            (!instance || value !== instance.name) &&
            cli.validators.match(/^[a-z][a-z0-9-]*$/)(value) &&
            cli.validators.maxLength(
              98 - `${project.id.get()}:${region}:`.length
            )(value)) ||
          `Cannot use name ${cli.colors.value(value)}`,
        default: instanceName
      }));
    tier =
      tier ||
      (await cli.prompts.select({
        message: 'Service tier for Cloud SQL instance',
        choices: await tiersListForCliPromptsSelect()
      }));
    return shell.gcloud<Instance>(
      `sql instances create ${instanceName} --region=${region} --tier=${tier}`
    );
  }
};
