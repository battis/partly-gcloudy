import * as lib from '#lib';
import { Validators } from '@qui-cli/validators';

type Options = {
  name?: string;
  defaultName?: string;
  purpose?: string;
  validate?: Validators.Validator;
};

export async function inputName({
  name,
  defaultName = lib.generate.projectId(),
  validate,
  ...options
}: Options = {}) {
  return await lib.prompts.input({
    arg: name,
    default: defaultName,
    message: 'Service account name',
    validate: Validators.combine(validate || (() => true), Validators.notEmpty),
    ...options
  });
}

export const inputIdentifier = inputName;
