import * as lib from '#lib';
import { Validators } from '@qui-cli/validators';

type Name = string;

type Options = {
  name?: string;
} & lib.PartialOptions<typeof lib.prompts.input<Name>>;

export async function inputName({ name, validate, ...options }: Options = {}) {
  return await lib.prompts.input<Name>({
    arg: name,
    message: 'Google Cloud project name',
    validate: Validators.combine(
      validate || (() => true),
      Validators.lengthBetween(6, 30)
    ),
    ...options
  });
}
