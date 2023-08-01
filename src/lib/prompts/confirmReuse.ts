import cli from '@battis/qui-cli';
import { Descriptor } from '../descriptor';
import confirm, { ConfirmOptions } from './confirm';
import { PromptConfig, pad } from './core';

/** @see @inquirer/confirm/dist/cjs/types/index.d.ts */

export type ReuseOptions<T extends Descriptor> = Partial<ConfirmOptions> &
  PromptConfig & {
    instance?: T;
    argDescription: string;
    arg?: boolean;
    name?: string;
    nameIn?: string;
  };

export default async function confirmReuse<T extends Descriptor>({
  arg,
  argDescription,
  instance,
  name,
  nameIn,
  purpose,
  ...args
}: ReuseOptions<T>) {
  if (
    await confirm({
      arg,
      message: `Reuse existing${pad(argDescription)}${pad(
        cli.colors.value(
          name ||
          (nameIn && instance[nameIn]) ||
          ('name' in instance && instance.name) ||
          ''
        )
      )}${pad(purpose)}`,
      ...args
    })
  ) {
    return instance;
  }
  return undefined;
}
