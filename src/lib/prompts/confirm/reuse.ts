import cli from '@battis/qui-cli';
import Descriptor from '../../Descriptor';
import * as core from '../core';

export default async function reuse<T extends Descriptor>({
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
      message: `Reuse existing${core.pad(argDescription)}${core.pad(
        cli.colors.value(name || instance[nameIn] || '')
      )}${core.pad(purpose)}`,
      ...rest
    }))
  ) {
    return instance;
  }
  return undefined;
}
