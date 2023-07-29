import cli from '@battis/qui-cli';
import lib from '../lib';
import { InputConfig } from '../lib/prompts/input';
import { SelectOptions } from '../lib/prompts/select';
import shell from '../shell';
import instances from './instances';

const SQL_MAX_PASSWORD_LENGTH = 15;

type User = {
  etag: string;
  host: string;
  instance: string;
  kind: string;
  name: string;
  passwordPolicy: {
    status: object;
  };
  project: string;
};

type ListOptions = {
  instance?: string;
};

type CreateOptions = {
  username: string;
  password: string;
  host: string;
  instance?: string;
};

type SetPasswordOptions = {
  username: string;
  password: string;
  instance?: string;
};

async function list(options?: ListOptions) {
  let { instance } = options;
  instance = await instances.selectIdentifier({
    instance,
    purpose: 'list users'
  });
  return shell.gcloud<User[]>(`sql users list --instance=${instance}`);
}

type InputIdentifierOptions = Partial<InputConfig> & {
  instance?: string;
  username?: string;
  purpose?: string;
};

async function inputUsername(options?: InputIdentifierOptions) {
  const { username, purpose = '', ...rest } = options;
  return (
    username ||
    (await cli.prompts.input({
      message: `MySQL username ${purpose}`,
      validate: cli.validators.lengthBetween(1, 32),
      ...rest
    }))
  );
}

type InputPasswordOptions = Partial<InputConfig> & {
  password?: string;
  purpose?: string;
};

async function inputPassword(options?: InputPasswordOptions) {
  const { password, purpose, ...rest } = options;
  return (
    password ||
    (await cli.prompts.input({
      message: `MySQL Password ${purpose}`,
      validate: cli.validators.maxLength(SQL_MAX_PASSWORD_LENGTH),
      default: lib.generate.password(SQL_MAX_PASSWORD_LENGTH),
      ...rest
    }))
  );
}

type SelectIdentifierOptins = Partial<SelectOptions> & {
  username?: string;
  purpose?: string;
};

async function selectIdentifier(options?: SelectIdentifierOptins) {
  const { username, purpose, ...rest } = options;
  return await lib.prompts.select({
    arg: username,
    message: `MySQL username${lib.prompts.pad(purpose)}`,
    choices: list,
    ...rest
  });
}

type DescribeOptions = { username?: string; instance?: string };

export default {
  list,
  selectIdentifier,
  inputIdentifier: inputUsername,

  inputUsername,
  inputPassword,

  describe: async function(options?: DescribeOptions) {
    const { username, instance } = options;
    return shell.gcloud<User>(
      `sql users describe "${await selectIdentifier({
        username
      })}" --instance=${await instances.selectIdentifier({ instance })}`
    );
  },

  create: async function({
    username,
    password,
    host,
    instance
  }: Partial<CreateOptions>) {
    instance = await instances.selectIdentifier({
      instance,
      purpose: 'create user'
    });
    host =
      host ||
      (await cli.prompts.input({
        message: 'Host from which this user will connect (% for any)',
        validate: cli.validators.isHostname({
          allowed: ['%'],
          ipAddress: true,
          localhost: true
        }),
        default: 'localhost'
      }));
    username = await inputUsername({
      instance,
      username,
      purpose: `to create`
    });
    password = await inputPassword({ password });

    return shell.gcloud<User>(
      `sql users create ${username} --host=${host} --instance=${instance} --password="${password}"`
    );
  },

  setPassword: async function({
    username,
    password,
    instance
  }: Partial<SetPasswordOptions>) {
    instance = await instances.selectIdentifier({
      instance,
      purpose: 'user password change'
    });
    username = await selectIdentifier({
      username,
      purpose: `on Cloud SQL instance ${cli.colors.value(instance)}`
    });
    password = await inputPassword({ password });
    shell.gcloud(
      `sql users set-password ${username} --instance=${instance} --password="${lib.prompts.escape(
        password
      )}"`
    );
  }
};
