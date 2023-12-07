import cli from '@battis/qui-cli';
import * as lib from '../../lib';
import * as shell from '../../shell';
import * as instances from '../instances';
import Database from './Database';

type DatabaseIdentifier = string;

export async function list({
  instance
}: {
  instance?: string;
} = {}) {
  instance = await instances.selectIdentifier({ instance });
  return await shell.gcloud<Database[]>(
    `gcloud sql databases list --instance=${instance}`
  );
}

export async function inputName({
  name,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<DatabaseIdentifier>>[0]> & {
  name?: string;
} = {}) {
  return await lib.prompts.input({
    arg: name,
    message: `MySQL database name`,
    validate: cli.validators.combine(
      validate,
      cli.validators.lengthBetween(1, 64)
    ),
    ...rest
  });
}

export const inputIdentifier = inputName;

export async function selectDatabase({
  name,
  instance,
  ...rest
}: Partial<lib.prompts.select.Parameters<Database>> &
  Partial<Parameters<typeof create>[0]> & {
    name?: DatabaseIdentifier;
    instance?: string;
  } = {}) {
  return await lib.prompts.select<Database>({
    arg: name,
    message: `MySQL database`,
    choices: async () =>
      (
        await list({ instance })
      ).map((d) => ({
        name: d.name,
        value: d
      })),
    transform: (d: Database) => d.name,
    ...rest
  });
}

export const selectIdentifier = selectDatabase;

export async function describe({
  name,
  instance
}: {
  name?: string;
  instance?: string;
}) {
  return await shell.gcloud<Database, lib.Undefined.Value>(
    `sql databases describe ${lib.prompts.escape(
      await selectDatabase({
        name
      })
    )} --instance=${await instances.selectIdentifier({ instance })}`,
    { error: lib.Undefined.callback }
  );
}

export async function create({
  name,
  charset,
  collation,
  instance
}: Partial<{
  name: string;
  instance?: string;
  charset?: string;
  collation?: string;
}> = {}) {
  instance = await instances.selectIdentifier({
    instance,
    purpose: 'create MySQL database'
  });
  name = await inputName({ name });
  return await shell.gcloud<Database>(
    `sql databases create ${lib.prompts.escape(name)} --instance=${instance}${
      charset ? ` --charset=${charset}` : ''
    }${collation ? ` --collation=${collation}` : ''}`
  );
}

export { type Database };
