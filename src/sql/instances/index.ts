import { Validators } from '@qui-cli/validators';
import * as app from '../../app/index.js';
import * as lib from '../../lib/index.js';
import * as projects from '../../projects/index.js';
import * as services from '../../services/index.js';
import * as shell from '../../shell/index.js';
import { Instance } from './Instance.js';
import * as tiers from '../tiers/index.js';

export { Instance };

type SqlInstanceIdentifier = string;

export const active = new lib.Active<Instance>(undefined);

export async function list() {
  return await shell.gcloud<Instance[]>('sql instances list');
}

export async function inputName({
  region,
  name,
  validate,
  instance,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<SqlInstanceIdentifier>>[0]> &
  Partial<{
    region: string;
    name?: string;
    instance?: Instance;
  }> = {}) {
  return await lib.prompts.input<SqlInstanceIdentifier>({
    arg: name,
    message: 'Cloud SQL instance name',
    validate: Validators.combine(
      validate || (() => true),
      instance === undefined
        ? () => true
        : (value?: string) =>
            lib.validators.exclude({
              exclude: instance,
              property: 'name'
            })(value) &&
            Validators.match(/^[a-z][a-z0-9-]*$/)(value) &&
            Validators.maxLength(
              98 - `${projects.active.get()}:${region}:`.length
            )(value)
    ),
    default: name || instance?.name,
    ...rest
  });
}

export async function describe({
  name
}: {
  name?: string;
} = {}) {
  return await shell.gcloud<Instance, lib.Undefined.Value>(
    `sql instances describe ${await inputName({
      name,
      region: active.get()?.region
    })}`,
    { error: lib.Undefined.callback }
  );
}

export const inputIdentifier = inputName;

export async function selectName({
  instance,
  ...rest
}: Partial<lib.prompts.select.Parameters<Instance>> &
  Partial<Parameters<typeof create>[0]> & {
    instance?: SqlInstanceIdentifier;
  } = {}) {
  return await lib.prompts.select<Instance>({
    arg: instance || active.get()?.name,
    argTransform: async (name) => await describe({ name }),
    message: `Cloud SQL instance`,
    choices: async () =>
      (await list()).map((i) => ({ name: i.name, value: i })),
    transform: (i: Instance) => i.name,
    ...rest
  });
}

export const selectIdentifier = selectName;

export async function create({
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
} = {}) {
  await services.enable(services.API.CloudSQLAdminAPI);
  let instance: Instance | undefined;
  if (name) {
    instance = await describe({ name });
    if (instance && reuseIfExists === undefined) {
      reuseIfExists = !!(await lib.prompts.confirm.reuse<Instance>({
        arg: reuseIfExists,
        argDescription: 'Cloud SQL instance',
        instance
      }));
    }
  }
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
    instance = await shell.gcloud<Instance>(
      `sql instances create ${name} --region=${region} --tier=${tier}`
    );
  }
  active.activate(instance);
  return instance;
}
