import cli from '@battis/qui-cli';
import lib from '../lib';
import { InputOptions, SelectOptions } from '../lib/prompts';
import shell from '../shell';
import instances from './instances';

export type Database = {
  charset: string;
  collation: string;
  etag: string;
  instance: string;
  kind: string;
  name: string;
  project: string;
  selfLink: string;
};

type ListOptions = {
  instance?: string;
};

type CreateOptions = {
  name: string;
  instance?: string;
  charset?: string;
  collation?: string;
};

async function list(options?: ListOptions) {
  let { instance } = options;
  instance = await instances.selectIdentifier({ instance });
  return shell.gcloud<Database[]>(
    `gcloud sql databases list --instance=${instance}`
  );
}
type DatabaseIdentifier = string;

type InputNameOptions = Partial<InputOptions<DatabaseIdentifier>> & {
  name?: string;
};

async function inputName(options?: InputNameOptions) {
  const { name, ...rest } = options;
  return await lib.prompts.input({
    arg: name,
    message: `MySQL database name`,
    validate: cli.validators.lengthBetween(1, 64),
    ...rest
  });
}

type SelectIdentifierOptions = Partial<SelectOptions> & {
  name?: DatabaseIdentifier;
  instance?: string;
};

async function selectDatabase(options?: SelectIdentifierOptions) {
  const { name, instance, ...rest } = options;
  return lib.prompts.select({
    arg: name,
    message: `MySQL database`,
    choices: () => list({ instance }),
    ...rest
  });
}

type DescribeOptions = {
  name?: string;
  instance?: string;
};

export default {
  list,
  inputName,
  inputIdentifier: inputName,
  selectDatabase,
  selectIdentifier: selectDatabase,

  describe: async function(options?: DescribeOptions) {
    const { name, instance } = options;
    return shell.gcloud<Database>(
      `sql databases describe ${lib.prompts.escape(
        await selectDatabase({
          name
        })
      )} --instance=${await instances.selectIdentifier({ instance })}`
    );
  },

  create: async function({
    name,
    charset,
    collation,
    instance
  }: Partial<CreateOptions>) {
    instance = await instances.selectIdentifier({
      instance,
      purpose: 'create MySQL database'
    });
    name = await inputName({ name });
    return shell.gcloud<Database>(
      `sql databases create ${lib.prompts.escape(name)} --instance=${instance}${charset ? ` --charset=${charset}` : ''
      }${collation ? ` --collation=${collation}` : ''}`
    );
  }
};
