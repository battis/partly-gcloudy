import cli from '@battis/qui-cli';
import FReuse from './confirm/reuse.js';
import * as core from './core.js';

export async function confirm({
  arg,
  message,
  purpose,
  ...rest
}: Parameters<typeof cli.prompts.confirm>[0] & {
  arg?: boolean;
  purpose?: string;
}) {
  return (
    (arg !== undefined && arg) ||
    (await cli.prompts.confirm({
      message: `${message}${core.pad(purpose)}`,
      ...rest
    }))
  );
}

export namespace confirm {
  export const reuse = FReuse;
}

export default confirm;
