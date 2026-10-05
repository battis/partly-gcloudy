import * as lib from '#lib';
import { UserType } from './UserType.js';

type Options = {
  userType?: UserType;
  purpose?: string;
};

export async function select({ userType, ...options }: Options = {}) {
  return (await lib.prompts.select({
    arg: userType,
    message: 'IAM user type',
    choices: [
      { name: 'User', value: 'user' },
      { name: 'Service Account', value: 'serviceAccount' },
      { name: 'Group', value: 'group' },
      { name: 'Domain', value: 'domain' }
    ],
    ...options
  })) as unknown as UserType;
}
