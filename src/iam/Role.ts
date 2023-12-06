import cli from '@battis/qui-cli';
import * as lib from '../lib';

export const Owner = 'roles/owner';
export const CloudSQL = {
  Client: 'roles/cloudsql.client'
};
export const IAP = {
  WebUser: 'roles/iap.httpsResourceAccessor'
};
export const SecretManager = {
  SecretAccessor: 'roles/secretmanager.secretAccessor'
};

export async function inputRole({
  role,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<IamRole>>[0]> & {
  role?: string;
} = {}) {
  return await lib.prompts.input({
    arg: role,
    message: 'IAM role',
    validate: cli.validators.combine(validate, cli.validators.notEmpty),
    ...rest
  });
}

export const inputIdentifier = inputRole;

export type IamRole = string;
