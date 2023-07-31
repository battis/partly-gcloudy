import cli from '@battis/qui-cli';
import { Descriptor } from '../descriptor';
import confirm, { ConfirmOptions } from './confirm';
import { pad } from './core';

/** @see @inquirer/confirm/dist/cjs/types/index.d.ts */

export type ReuseOptions<T extends Descriptor> = Partial<ConfirmOptions> & {
  description: string;
  reuse?: boolean;
  instance?: T;
  name?: string;
  purpose?: string;
};

export default async function confirmReuse<T extends Descriptor>({
  description,
  reuse,
  instance,
  name,
  purpose,
  ...args
}: ReuseOptions<T>) {
  if (
    await confirm({
      arg: reuse,
      message: `Reuse existing ${description} ${cli.colors.value(
        name || ('name' in instance && instance.name) || ''
      )}${pad(purpose)}`,
      ...args
    })
  ) {
    return instance;
  }
  return undefined;
}
