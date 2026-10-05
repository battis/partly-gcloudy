import * as lib from '#lib';
import { Validators } from '@qui-cli/validators';

type Options = {
  role?: string;
  purpose?: string;
  validate?: Validators.Validator;
};

export async function inputRole({ role, validate, ...options }: Options = {}) {
  return await lib.prompts.input({
    arg: role,
    message: 'IAM role',
    validate: Validators.combine(validate || (() => true), Validators.notEmpty),
    ...options
  });
}

export const inputIdentifier = inputRole;

export type IamRole = string;
