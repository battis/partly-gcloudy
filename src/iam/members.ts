import cli from '@battis/qui-cli';
import type { Email } from '../lib.js';
import * as lib from '../lib.js';
import { UserType } from './members/UserType.js';

export { UserType };

export async function selectUserType({
  userType,
  ...rest
}: Partial<lib.prompts.select.Parameters> & {
  userType?: UserType;
} = {}) {
  return (await lib.prompts.select({
    arg: userType,
    message: `IAM user type`,
    choices: [
      { value: 'user' },
      { value: 'serviceAccount' },
      { value: 'group' }
    ],
    ...rest
  })) as unknown as UserType;
}

export async function inputMember({
  member,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<Email>>[0]> & {
  member?: string;
} = {}) {
  return await lib.prompts.input({
    arg: member,
    message: `IAM Member`,
    validate: cli.validators.combine(validate, cli.validators.email()),
    ...rest
  });
}

export const inputIdentifier = inputMember;
