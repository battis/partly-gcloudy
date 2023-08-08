import cli from '@battis/qui-cli';
import prompts from '../core';
import MReuse from './reuse';

async function confirm({
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
      message: `${message}${prompts.pad(purpose)}`,
      ...rest
    }))
  );
}

namespace confirm {
  export import reuse = MReuse; // eslint-disable-line @typescript-eslint/no-unused-vars
}

export { confirm as default };
