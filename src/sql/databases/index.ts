import cli from '@battis/qui-cli';
import lib from '../../lib';
import shell from '../../shell';
import instances from '../instances';
import TDatabase from './Database';

type DatabaseIdentifier = string;

class databases {
  public static async list({
    instance
  }: {
    instance?: string;
  } = undefined) {
    instance = await instances.selectIdentifier({ instance });
    return shell.gcloud<databases.Database[]>(
      `gcloud sql databases list --instance=${instance}`
    );
  }

  public static async inputName({
    name,
    validate,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input<DatabaseIdentifier>>[0]> & {
    name?: string;
  } = undefined) {
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

  public static inputIdentifier = this.inputName;

  public static async selectDatabase({
    name,
    instance,
    ...rest
  }: Partial<lib.prompts.select.Parameters.ValueToString<databases.Database>> &
    Partial<Parameters<typeof this.create>[0]> & {
      name?: DatabaseIdentifier;
      instance?: string;
    } = undefined) {
    return lib.prompts.select<databases.Database>({
      arg: name,
      message: `MySQL database`,
      choices: async () =>
        (await this.list({ instance })).map((d) => ({
          name: d.name,
          value: d
        })),
      transform: (d: databases.Database) => d.name,
      ...rest
    });
  }

  public static selectIdentifier = this.selectDatabase;

  public static async describe({
    name,
    instance
  }: {
    name?: string;
    instance?: string;
  }) {
    return shell.gcloud<databases.Database>(
      `sql databases describe ${lib.prompts.escape(
        await this.selectDatabase({
          name
        })
      )} --instance=${await instances.selectIdentifier({ instance })}`
    );
  }

  public static async create({
    name,
    charset,
    collation,
    instance
  }: {
    name: string;
    instance?: string;
    charset?: string;
    collation?: string;
  } = undefined) {
    instance = await instances.selectIdentifier({
      instance,
      purpose: 'create MySQL database'
    });
    name = await this.inputName({ name });
    return shell.gcloud<databases.Database>(
      `sql databases create ${lib.prompts.escape(name)} --instance=${instance}${charset ? ` --charset=${charset}` : ''
      }${collation ? ` --collation=${collation}` : ''}`
    );
  }
}

namespace databases {
  export type Database = TDatabase;
}

export { databases as default };
