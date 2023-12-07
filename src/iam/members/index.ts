import cli from '@battis/qui-cli';
import { getEnumValues } from '@battis/typescript-tricks';
import * as lib from '../../lib';
import type { Email } from '../../lib';
import UserType from './UserType';

export async function selectUserType({
  userType,
  ...rest
}: Partial<lib.prompts.select.Parameters> & {
  userType?: UserType;
} = {}): Promise<UserType> {
  return UserType[
    (await lib.prompts.select({
      arg: userType?.toString(),
      validate: (value?: string) =>
        value !== undefined &&
        getEnumValues(UserType)
          .map((u) => u.toString())
          .includes(value),
      message: `IAM user type`,
      choices: () =>
        getEnumValues(UserType).map((t) => ({ value: t.toString() })),
      ...rest
    })) as keyof typeof UserType
  ];
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
    validate: cli.validators.combine(validate, cli.validators.email),
    ...rest
  });
}

export const inputIdentifier = inputMember;

export { UserType };
