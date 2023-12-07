import cli from '@battis/qui-cli';
import * as lib from '../../lib';
import type { Email } from '../../lib';
import * as shell from '../../shell';
import * as instances from '../instances';
import User from './User';

export type Hostname = string;

export const SQL_MAX_PASSWORD_LENGTH = 15;

export async function list({
  instance
}: {
  instance?: string;
} = {}) {
  instance = await instances.selectIdentifier({
    instance,
    purpose: 'list users'
  });
  return await shell.gcloud<User[]>(`sql users list --instance=${instance}`);
}

export async function inputUsername({
  username,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<Email>>[0]> & {
  instance?: string;
  username?: string;
} = {}) {
  return await lib.prompts.input({
    arg: username,
    message: 'MySQL username',
    validate: cli.validators.combine(
      validate,
      cli.validators.lengthBetween(1, 32)
    ),
    ...rest
  });
}

export const inputIdentifier = inputUsername;

export async function inputPassword({
  password,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<string>>[0]> & {
  password?: string;
} = {}) {
  return await lib.prompts.input({
    arg: password,
    message: 'MySQL Password',
    validate: cli.validators.combine(
      validate,
      cli.validators.maxLength(SQL_MAX_PASSWORD_LENGTH)
    ),
    default: lib.generate.password(SQL_MAX_PASSWORD_LENGTH),
    ...rest
  });
}

export async function inputHost({
  host,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<Hostname>>[0]> & {
  host?: string;
} = {}) {
  return await lib.prompts.input({
    arg: host,
    message: 'Host from which this user will connect (% for any)',
    validate: cli.validators.combine(
      validate,
      cli.validators.isHostname({
        allowed: ['%'],
        ipAddress: true,
        localhost: true
      })
    ),
    default: 'localhost',
    ...rest
  });
}

export async function selectUsername({
  username,
  instance,
  ...rest
}: Partial<lib.prompts.select.Parameters<User>> &
  Partial<Parameters<typeof create>[0]> & {
    username?: Email;
    instance?: string;
  } = {}) {
  return await lib.prompts.select<User>({
    arg: username,
    message: `MySQL username`,
    choices: async () =>
      (
        await list({ instance })
      ).map((u) => ({ name: `${u.name}@${u.host}`, value: u })),
    transform: (u: User) => u.name,
    ...rest
  });
}

export const selectIdentifier = selectUsername;

export async function describe({
  username,
  instance
}: { username?: string; instance?: string } = {}) {
  return await shell.gcloud<User, lib.Undefined.Value>(
    `sql users describe ${lib.prompts.escape(
      await selectUsername({
        username
      })
    )} --instance=${await instances.selectIdentifier({ instance })}`,
    { error: lib.Undefined.callback }
  );
}

export async function create({
  username,
  password,
  host,
  instance
}: {
  username?: string;
  password?: string;
  host?: string;
  instance?: string;
} = {}) {
  instance = await instances.selectIdentifier({
    instance,
    purpose: 'create user'
  });
  host = await inputHost({ host });
  username = await inputUsername({
    username,
    purpose: `to create`,
    validate: (value?: string) =>
      instance === undefined
        ? true
        : lib.validators.exclude({ exclude: instance })(value) &&
          cli.validators.notEmpty(value)
  });
  password = await inputPassword({ password });

  return await shell.gcloud<User>(
    `sql users create ${lib.prompts.escape(
      username
    )} --host=${host} --instance=${instance} --password=${lib.prompts.escape(
      password
    )}`
  );
}

export async function setPassword({
  username,
  password,
  instance
}: {
  username?: string;
  password?: string;
  instance?: string;
} = {}) {
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
  await shell.gcloud(
    `sql users set-password ${lib.prompts.escape(
      username
    )} --instance=${instance} --password=${lib.prompts.escape(password)}`
  );
  return password;
}

export { type User };
