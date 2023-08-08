import cli from '@battis/qui-cli';
import lib from '../../lib';
import shell from '../../shell';
import instances from '../instances';
import TUser from './User';

type Hostname = string;

class users {
  protected constructor() {
    // ignore
  }

  public static SQL_MAX_PASSWORD_LENGTH = 15;

  public static async list({
    instance
  }: {
    instance?: string;
  } = undefined) {
    instance = await instances.selectIdentifier({
      instance,
      purpose: 'list users'
    });
    return shell.gcloud<users.User[]>(`sql users list --instance=${instance}`);
  }

  public static async inputUsername({
    username,
    validate,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input<lib.Email>>[0]> & {
    instance?: string;
    username?: string;
  } = undefined) {
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

  public static inputIdentifier = this.inputUsername;

  public static async inputPassword({
    password,
    validate,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input<string>>[0]> & {
    password?: string;
  } = undefined) {
    return await lib.prompts.input({
      arg: password,
      message: 'MySQL Password',
      validate: cli.validators.combine(
        validate,
        cli.validators.maxLength(this.SQL_MAX_PASSWORD_LENGTH)
      ),
      default: lib.generate.password(this.SQL_MAX_PASSWORD_LENGTH),
      ...rest
    });
  }

  public static async inputHost({
    host,
    validate,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input<Hostname>>[0]> & {
    host?: string;
  } = undefined) {
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

  public static async selectUsername({
    username,
    instance,
    ...rest
  }: Partial<lib.prompts.select.Parameters.ValueToString<users.User>> &
    Partial<Parameters<typeof this.create>[0]> & {
      username?: lib.Email;
      instance?: string;
    } = undefined) {
    return await lib.prompts.select<users.User>({
      arg: username,
      message: `MySQL username`,
      choices: async () =>
        (
          await this.list({ instance })
        ).map((u) => ({ name: `${u.name}@${u.host}`, value: u })),
      transform: (u: users.User) => u.name,
      ...rest
    });
  }

  public static selectIdentifier = this.selectUsername;

  public static async describe({
    username,
    instance
  }: { username?: string; instance?: string } = undefined) {
    return shell.gcloud<users.User>(
      `sql users describe ${lib.prompts.escape(
        await this.selectUsername({
          username
        })
      )} --instance=${await instances.selectIdentifier({ instance })}`
    );
  }

  public static async create({
    username,
    password,
    host,
    instance
  }: {
    username?: string;
    password?: string;
    host?: string;
    instance?: string;
  } = undefined) {
    instance = await instances.selectIdentifier({
      instance,
      purpose: 'create user'
    });
    host = await this.inputHost({ host });
    username = await this.inputUsername({
      username,
      purpose: `to create`,
      validate: (value?: string) =>
        lib.validators.exclude({ exclude: instance })(value) &&
        cli.validators.notEmpty(value)
    });
    password = await this.inputPassword({ password });

    return shell.gcloud<users.User>(
      `sql users create ${lib.prompts.escape(
        username
      )} --host=${host} --instance=${instance} --password=${lib.prompts.escape(
        password
      )}`
    );
  }

  public static async setPassword({
    username,
    password,
    instance
  }: {
    username?: string;
    password?: string;
    instance?: string;
  } = undefined) {
    instance = await instances.selectIdentifier({
      instance,
      purpose: 'on which to change user password'
    });
    username = await this.selectUsername({
      username,
      purpose: `to change password for on Cloud SQL instance ${cli.colors.value(
        instance
      )}`
    });
    password = await this.inputPassword({
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
}

namespace users {
  export type User = TUser;
}

export { users as default };
