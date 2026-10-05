import * as lib from '#lib';
import { Validators } from '@qui-cli/validators';

export type DisplayName = string;

type Options = {
  displayName?: string;
  default?: string;
  purpose?: string;
  validate?: Validators.Validator;
};

export async function inputDisplayName({
  displayName,
  validate,
  ...options
}: Options = {}) {
  return await lib.prompts.input({
    arg: displayName,
    message: 'Service account display name',
    validate: Validators.combine(validate || (() => true), Validators.notEmpty),
    ...options
  });
}
