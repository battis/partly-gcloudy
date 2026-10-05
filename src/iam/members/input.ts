import * as lib from '#lib';
import { Validators } from '@qui-cli/validators';

type Options = {
  member?: string;
  purpose?: string;
  validate?: Validators.Validator;
};

export async function input({ member, validate, ...options }: Options = {}) {
  return await lib.prompts.input({
    arg: member,
    message: 'IAM Member',
    validate: Validators.combine(
      validate || (() => true),
      (value?: string) =>
        Validators.email()(value) ||
        Validators.isHostname({
          localhost: false,
          ipAddress: false,
          wildcard: false
        })(value)
    ),
    ...options
  });
}
