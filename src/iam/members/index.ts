import cli from '@battis/qui-cli';
import { getEnumValues } from '@battis/typescript-tricks';
import * as lib from '../../lib';
import UserType from './UserType';

export async function selectUserType({
  userType,
  ...rest
}: Partial<lib.prompts.select.Parameters.StringToString> & {
  userType?: string;
} = undefined): Promise<UserType> {
  return this.caller[
    await lib.prompts.select({
      arg: userType,
      validate: (value?: string) =>
        getEnumValues(UserType)
          .map((u) => u.toString())
          .includes(value),
      message: `IAM user type`,
      choices: () =>
        getEnumValues(UserType).map((t) => ({ value: t.toString() })),
      ...rest
    })
  ];
}

export async function inputMember({
  member,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<lib.Email>>[0]> & {
  member?: string;
} = undefined) {
  return await lib.prompts.input({
    arg: member,
    message: `IAM Member`,
    validate: cli.validators.combine(validate, cli.validators.email),
    ...rest
  });
}

export const inputIdentifier = inputMember;

export { type UserType };
