import * as lib from '#lib';
import { Validators } from '@qui-cli/validators';

type DisplayName = string;

type Options = lib.PartialOptions<typeof lib.prompts.input<DisplayName>>;

export async function inputDisplayName({
  displayName,
  validate,
  ...rest
}: Options & {
  displayName?: string;
} = {}) {
  return await lib.prompts.input<DisplayName>({
    arg: displayName,
    message: 'IAP OAuth client display name',
    validate: Validators.combine(validate || (() => true), Validators.notEmpty),
    ...rest
  });
}
