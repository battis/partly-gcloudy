import { confirm as pConfirm } from '@inquirer/prompts';
import * as core from '../core/index.js';
import { reuse as FReuse } from './reuse.js';

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

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace confirm {
  export const reuse = FReuse;
}
