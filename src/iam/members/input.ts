import * as lib from '#lib';
import { Validators } from '@qui-cli/validators';

export async function input({
  member,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<lib.Email>>[0]> & {
  member?: string;
} = {}) {
  return await lib.prompts.input({
    arg: member,
    message: `IAM Member`,
    validate: Validators.combine(validate || (() => true), Validators.email()),
    ...rest
  });
}
