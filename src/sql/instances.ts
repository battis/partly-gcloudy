import cli from '@battis/qui-cli';
import app from '../app';
import lib from '../lib';
import Active from '../lib/active';
import { InputOptions, SelectOptions } from '../lib/prompts';
import projects from '../projects';
import services from '../services';
import shell from '../shell';
import tiers from './tiers';

type CreateOptions = {
  name: string;
  region: string;
  tier: string;
  databaseVersion: string;
  edition: string;
  cpu: number;
  memory: string;
  reuseIfExists: boolean;
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

const list = async () => shell.gcloud<Instance[]>('sql instances list');

type SqlInstanceIdentifier = string;

type InputIdentifierOptions = Partial<InputOptions<SqlInstanceIdentifier>> & {
  region: string;
  name?: string;
  instance?: Instance;
};

async function inputName(options?: InputIdentifierOptions) {
  const { region, name, instance, ...rest } = options;
  return await lib.prompts.input<SqlInstanceIdentifier>({
    arg: name,
    message: 'Cloud SQL instance name',
    instance,
    validate: (value?: string) =>
      cli.validators.match(/^[a-z][a-z0-9-]*$/)(value) &&
      cli.validators.maxLength(
        98 - `${projects.active.get()}:${region}:`.length
      )(value),
    default: name || instance?.name,
    ...rest
  });
}

type DescribeOptions = {
  name?: string;
};

async function describe(options?: DescribeOptions) {
  const { name } = options;
  return shell.gcloud<Instance>(
    `sql instances describe ${await inputName({
      name,
      region: active.instance()?.region
    })}`
  );
}

type SelectNameOptions = Partial<SelectOptions> & {
  instance?: SqlInstanceIdentifier;
};

async function selectName(options?: SelectNameOptions) {
  const { instance, ...rest } = options;
  return await lib.prompts.select({
    arg: instance || active.get(),
    message: `Cloud SQL instance`,
    choices: list,
    ...rest
  });
}

const active = new Active<Instance>();

export default {
  list,
  inputName,
  inputIdentifier: inputName,
  selectName,
  selectIdentifier: selectName,
  active,
  describe,

  create: async function({
    name,
    region,
    tier,
    reuseIfExists
  }: Partial<CreateOptions>) {
    services.enable({ service: services.API.CloudSQLAdminAPI });
    let instance: Instance =
      name &&
      (await lib.prompts.confirmReuse<Instance>({
        arg: reuseIfExists,
        instance: await describe({ name }),
        argDescription: 'Cloud SQL instance'
      }));

    if (!instance || reuseIfExists === false) {
      // TODO apparently no way to list available Cloud SQL regions at the moment https://cloud.google.com/sql/docs/instance-locations
      region = await app.regions.selectIdentifier({
        region,
        purpose: 'create Cloud SQL instance'
      });
      name = await inputName({
        region,
        name,
        instance
      });
      tier = await tiers.selectIdentifier({ tier });
      instance = shell.gcloud<Instance>(
        `sql instances create ${name} --region=${region} --tier=${tier}`
      );
    }
    active.set(instance.name, instance);
    return instance;
  }
};
