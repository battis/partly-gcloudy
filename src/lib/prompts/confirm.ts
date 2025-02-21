import { confirm as pConfirm } from '@inquirer/prompts';
import { reuse as FReuse } from './confirm/reuse.js';
import * as core from './core.js';

export async function confirm({
  arg,
  message,
  purpose,
  ...rest
}: Parameters<typeof pConfirm>[0] & {
  arg?: boolean;
  purpose?: string;
}) {
  return (
    (arg !== undefined && arg) ||
    (await pConfirm({
      message: `${message}${core.pad(purpose)}`,
      ...rest
    }))
  );
}

export namespace confirm {
  export const reuse = FReuse;
}
