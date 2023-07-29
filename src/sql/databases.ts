import cli from '@battis/qui-cli';
import lib from '../lib';
import { InputConfig } from '../lib/prompts/input';
import { SelectOptions } from '../lib/prompts/select';
import shell from '../shell';
import instances from './instances';

type Database = {
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

type InputNameOptions = Partial<InputConfig> & {
  name?: string;
  purpose?: string;
};

async function inputName(options?: InputNameOptions) {
  const { name, purpose, ...rest } = options;
  return (
    name ||
    (await cli.prompts.input({
      message: `MySQL database name${lib.prompts.pad(purpose)}`,
      validate: cli.validators.lengthBetween(1, 64),
      ...rest
    }))
  );
}

type SelectIdentifierOptions = Partial<SelectOptions> & {
  name?: string;
  instance?: string;
  purpose?: string;
};

async function selectIdentifier(options?: SelectIdentifierOptions) {
  const { name, instance, purpose, ...rest } = options;
  return lib.prompts.select({
    arg: name,
    message: `MySQL database name${lib.prompts.pad(purpose)}`,
    choices: list,
    ...rest
  });
}

type DescribeOptions = {
  name?: string;
  instance?: string;
};

export default {
  list,

  describe: async function(options?: DescribeOptions) {
    const { name, instance } = options;
    return shell.gcloud<Database>(
      `sql databases describe "${await selectIdentifier({
        name
      })}" --instance=${await instances.selectIdentifier({ instance })}`
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
      purpose: 'creat MySQL database'
    });
    name = await inputName({ name });
    return shell.gcloud<Database>(
      `sql databases create "${name}" --instance=${instance}${charset ? ` --charset=${charset}` : ''
      }${collation ? ` --collation=${collation}` : ''}`
    );
  }
};
