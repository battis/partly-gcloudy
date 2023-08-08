import cli from '@battis/qui-cli';
import { getEnumValues } from '@battis/typescript-tricks';
import lib from '../../lib';
import TUserType from './UserType';

class members {
  protected constructor() {
    // ignore
  }

  public static async selectUserType({
    userType,
    ...rest
  }: Partial<lib.prompts.select.Parameters.StringToString> & {
    userType?: string;
  } = undefined): Promise<members.UserType> {
    return members.caller[
      await lib.prompts.select({
        arg: userType,
        validate: (value?: string) =>
          getEnumValues(members.UserType)
            .map((u) => u.toString())
            .includes(value),
        message: `IAM user type`,
        choices: () =>
          getEnumValues(members.UserType).map((t) => ({ value: t.toString() })),
        ...rest
      })
    ];
  }

  public static async inputMember({
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

  public static inputIdentifier = this.inputMember;
}

namespace members {
  export import UserType = TUserType; // eslint-disable-line @typescript-eslint/no-unused-vars
}

export { members as default };
