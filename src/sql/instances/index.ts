import cli from '@battis/qui-cli';
import app from '../../app';
import lib from '../../lib';
import projects from '../../projects';
import services from '../../services';
import shell from '../../shell';
import tiers from '../tiers';
import TInstance from './Instance';

type SqlInstanceIdentifier = string;

class instances {
  protected constructor() {
    // ignore
  }

  public static active = new lib.Active<instances.Instance>(undefined);

  public static list = async () =>
    shell.gcloud<instances.Instance[]>('sql instances list');

  public static async inputName({
    region,
    name,
    validate,
    instance,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input<SqlInstanceIdentifier>>[0]> & {
    region: string;
    name?: string;
    instance?: instances.Instance;
  } = undefined) {
    return await lib.prompts.input<SqlInstanceIdentifier>({
      arg: name,
      message: 'Cloud SQL instance name',
      validate: cli.validators.combine(
        validate,
        (value?: string) =>
          lib.validators.exclude({
            exclude: instance,
            property: 'name'
          })(value) &&
          cli.validators.match(/^[a-z][a-z0-9-]*$/)(value) &&
          cli.validators.maxLength(
            98 - `${projects.active.get()}:${region}:`.length
          )(value)
      ),
      default: name || instance?.name,
      ...rest
    });
  }

  public static async describe({
    name
  }: {
    name?: string;
  } = undefined) {
    return shell.gcloud<instances.Instance>(
      `sql instances describe ${await this.inputName({
        name,
        region: this.active.get()?.region
      })}`
    );
  }

  public static inputIdentifier = this.inputName;

  public static async selectName({
    instance,
    ...rest
  }: Partial<lib.prompts.select.Parameters.ValueToString<instances.Instance>> &
    Partial<Parameters<typeof this.create>[0]> & {
      instance?: SqlInstanceIdentifier;
    } = undefined) {
    return await lib.prompts.select<instances.Instance>({
      arg: instance || this.active.get().name,
      message: `Cloud SQL instance`,
      choices: async () =>
        (await this.list()).map((i) => ({ name: i.name, value: i })),
      transform: (i: instances.Instance) => i.name,
      ...rest
    });
  }

  public static selectIdentifier = this.selectName;

  public static async create({
    name,
    region,
    tier,
    reuseIfExists
  }: {
    name?: string;
    region?: string;
    tier?: string;
    databaseVersion?: string;
    edition?: string;
    cpu?: number;
    memory?: string;
    reuseIfExists?: boolean;
  } = undefined) {
    services.enable({ service: services.API.CloudSQLAdminAPI });
    let instance: instances.Instance =
      name &&
      (await lib.prompts.confirm.reuse<instances.Instance>({
        arg: reuseIfExists,
        argDescription: 'Cloud SQL instance',
        instance: await this.describe({ name })
      }));

    if (!instance || reuseIfExists === false) {
      // TODO apparently no way to list available Cloud SQL regions at the moment https://cloud.google.com/sql/docs/instance-locations
      region = await app.regions.selectIdentifier({
        region,
        purpose: 'create Cloud SQL instance'
      });
      name = await this.inputName({
        region,
        name,
        instance
      });
      tier = await tiers.selectIdentifier({ tier });
      instance = shell.gcloud<instances.Instance>(
        `sql instances create ${name} --region=${region} --tier=${tier}`
      );
    }
    this.active.activate(instance);
    return instance;
  }
}

namespace instances {
  export type Instance = TInstance;
}

export { instances as default };
