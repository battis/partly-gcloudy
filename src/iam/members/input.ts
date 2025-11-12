import { Validators } from '@qui-cli/validators';
import type { Email } from '../../lib/index.js';
import * as lib from '../../lib/index.js';

export async function input({
  member,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<Email>>[0]> & {
  member?: string;
} = {}) {
  return await lib.prompts.input({
    arg: member,
    message: `IAM Member`,
    validate: Validators.combine(validate || (() => true), Validators.email()),
    ...rest
  });
}
