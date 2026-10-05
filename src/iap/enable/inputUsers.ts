import * as lib from '#lib';
import { Validators } from '@qui-cli/validators';

function splitUsers(value: string) {
  return value?.split(',').map((part) => part.trim()) || [];
}
type Options = {
  users?: string | string[];
  purpose?: string;
  validate?: Validators.Validator;
};

export async function inputUsers({
  users,
  validate,
  ...options
}: Options = {}) {
  if (Array.isArray(users)) {
    users = users.join(',');
  }
  return splitUsers(
    await lib.prompts.input({
      arg: users,
      message: 'Users with access to app via IAP (comma-separated)',
      validate: Validators.combine(
        validate || (() => true),
        (value?: string) =>
          (Validators.notEmpty(value) === true &&
            splitUsers(value || '')
              .map(Validators.email())
              .reduce(
                (valid: boolean, test) => valid && test === true,
                true
              )) ||
          'Must be comma-separated list of valid emails'
      ),
      ...options
    })
  );
}
