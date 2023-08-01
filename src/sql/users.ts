import cli from '@battis/qui-cli';
import lib, { Email } from '../lib';
import { InputOptions, SelectOptions } from '../lib/prompts';
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

type InputIdentifierOptions = Partial<InputOptions<Email>> & {
  instance?: string;
  username?: string;
};

async function inputUsername(options?: InputIdentifierOptions) {
  const { username, ...rest } = options;
  return await lib.prompts.input({
    arg: username,
    message: 'MySQL username',
    validate: cli.validators.lengthBetween(1, 32),
    ...rest
  });
}

type InputPasswordOptions = Partial<InputOptions<string>> & {
  password?: string;
};

async function inputPassword(options?: InputPasswordOptions) {
  const { password, ...rest } = options;
  return await lib.prompts.input({
    arg: password,
    message: 'MySQL Password',
    validate: cli.validators.maxLength(SQL_MAX_PASSWORD_LENGTH),
    default: lib.generate.password(SQL_MAX_PASSWORD_LENGTH),
    ...rest
  });
}

type Hostname = string;

type InputHostOptions = Partial<InputOptions<Hostname>> & {
  host?: string;
};

async function inputHost(options?: InputHostOptions) {
  const { host } = options;
  return await lib.prompts.input({
    arg: host,
    message: 'Host from which this user will connect (% for any)',
    validate: cli.validators.isHostname({
      allowed: ['%'],
      ipAddress: true,
      localhost: true
    }),
    default: 'localhost'
  });
}

type SelectIdentifierOptins = Partial<SelectOptions> & {
  username?: Email;
  instance?: string;
};

async function selectUsername(options?: SelectIdentifierOptins) {
  const { username, instance, ...rest } = options;
  return await lib.prompts.select({
    arg: username,
    message: `MySQL username`,
    choices: () => list({ instance }),
    ...rest
  });
}

type DescribeOptions = { username?: string; instance?: string };

export default {
  list,
  selectUsername,
  selectIdentifier: selectUsername,
  inputUsername,
  inputIdentifier: inputUsername,
  inputPassword,

  describe: async function(options?: DescribeOptions) {
    const { username, instance } = options;
    return shell.gcloud<User>(
      `sql users describe ${lib.prompts.escape(
        await selectUsername({
          username
        })
      )} --instance=${await instances.selectIdentifier({ instance })}`
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
    host = await inputHost({ host });
    username = await inputUsername({
      name: instance,
      username,
      purpose: `to create`
    });
    password = await inputPassword({ password });

    return shell.gcloud<User>(
      `sql users create ${lib.prompts.escape(
        username
      )} --host=${host} --instance=${instance} --password=${lib.prompts.escape(
        password
      )}`
    );
  },

  setPassword: async function({
    username,
    password,
    instance
  }: Partial<SetPasswordOptions>) {
    instance = await instances.selectIdentifier({
      instance,
      purpose: 'on which to change user password'
    });
    username = await selectUsername({
      username,
      purpose: `to change password for on Cloud SQL instance ${cli.colors.value(
        instance
      )}`
    });
    password = await inputPassword({
      password,
      purpose: `for ${cli.colors.value(
        username
      )} on Cloud SQL instance ${cli.colors.value(instance)}`
    });
    shell.gcloud(
      `sql users set-password ${lib.prompts.escape(
        username
      )} --instance=${instance} --password=${lib.prompts.escape(password)}`
    );
    return password;
  }
};
