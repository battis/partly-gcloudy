import cli from '@battis/qui-cli';
import Descriptor from '../../Descriptor';
import prompts from '../core';

async function reuse<T extends Descriptor>({
  arg,
  argDescription,
  instance,
  name,
  nameIn = 'name',
  purpose,
  ...rest
}: Omit<Parameters<typeof cli.prompts.confirm>[0], 'message'> & {
  arg?: boolean;
  argDescription: string;
  purpose?: string;
  instance?: T;
  name?: string;
  nameIn?: string;
}): Promise<T> {
  if (
    arg === true ||
    (await cli.prompts.confirm({
      message: `Reuse existing${prompts.pad(argDescription)}${prompts.pad(
        cli.colors.value(name || instance[nameIn] || '')
      )}${prompts.pad(purpose)}`,
      ...rest
    }))
  ) {
    return instance;
  }
  return undefined;
}

namespace reuse { }

export { reuse as default };
