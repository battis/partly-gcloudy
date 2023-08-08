import cli from '@battis/qui-cli';
import lib from '../lib';

class Role {
  public static Owner = 'roles/owner';
  public static CloudSQL = {
    Client: 'roles/cloudsql.client'
  };
  public static IAP = {
    WebUser: 'roles/iap.httpsResourceAccessor'
  };
  public static SecretManager = {
    SecretAccessor: 'roles/secretmanager.secretAccessor'
  };

  public static async inputRole({
    role,
    validate,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input<Role.IamRole>>[0]> & {
    role?: string;
  } = undefined) {
    return await lib.prompts.input({
      arg: role,
      message: 'IAM role',
      validate: cli.validators.combine(validate, cli.validators.notEmpty),
      ...rest
    });
  }

  public static inputIdentifier = this.inputRole;
}

namespace Role {
  export type IamRole = string;
}

export { Role as default };
