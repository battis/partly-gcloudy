import { Colors } from '@qui-cli/colors';
import { confirm } from '@inquirer/prompts';
import { Descriptor } from '../../Descriptor.js';
import * as core from '../core/index.js';

type Options<T extends Descriptor> = Omit<
  Parameters<typeof confirm>[0],
  'message'
> & {
  arg?: boolean;
  argDescription: string;
  purpose?: string;
  instance?: T;
  name?: string;
  nameIn?: string;
};

export async function reuse<T extends Descriptor>({
  arg,
  argDescription,
  instance,
  name,
  nameIn = 'name',
  purpose,
  ...options
}: Options<T>): Promise<T | undefined> {
  if (
    arg === true ||
    (await confirm({
      message: `Reuse existing${core.pad(argDescription)}${core.pad(
        Colors.value(name || (instance && instance[nameIn]) || '')
      )}${core.pad(purpose)}`,
      ...options
    }))
  ) {
    return instance;
  }
  return undefined;
}
