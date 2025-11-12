import * as lib from '../../../lib/index.js';
import { UserType } from './UserType.js';

export async function select({
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
