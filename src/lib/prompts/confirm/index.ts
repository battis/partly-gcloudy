import { confirm as pConfirm } from '@inquirer/prompts';
import * as core from '../core/index.js';
import { reuse as FReuse } from './reuse.js';

export async function confirm({
  arg,
  message,
  purpose,
  ...options
}: confirm.Options) {
  return (
    (arg !== undefined && arg) ||
    (await pConfirm({
      message: `${message}${core.pad(purpose)}`,
      ...options
    }))
  );
}

export namespace confirm {
  export type Options = {
    arg?: boolean;
    purpose?: string;
  } & Parameters<typeof pConfirm>[0];

  export const reuse = FReuse;
}
