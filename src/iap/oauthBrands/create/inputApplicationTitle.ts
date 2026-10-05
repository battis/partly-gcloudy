import * as lib from '#lib';
import { Validators } from '@qui-cli/validators';

type Options = {
  applicationTitle?: string;
  default?: string;
  purpose?: string;
  validate?: Validators.Validator;
};

export async function inputApplicationTitle({
  applicationTitle,
  validate,
  ...options
}: Options = {}) {
  return await lib.prompts.input({
    arg: applicationTitle,
    message: 'Application title for OAuth consent dialog',
    validate: Validators.combine(validate || (() => true), Validators.notEmpty),
    ...options
  });
}
