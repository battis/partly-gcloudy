import * as lib from '#lib';
import { Validators } from '@qui-cli/validators';

type Options = {
  supportEmail?: lib.Email;
  purpose?: string;
  validate?: Validators.Validator;
};

export async function inputSupportEmail({
  supportEmail,
  validate,
  ...options
}: Options = {}) {
  return await lib.prompts.input({
    arg: supportEmail,
    message: 'Support email from OAuth consent dialog',
    validate: Validators.combine(validate || (() => true), Validators.email()),
    default: supportEmail,
    ...options
  });
}
