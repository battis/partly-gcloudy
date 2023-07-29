import cli from '@battis/qui-cli';
import { AsyncPromptConfig } from '@inquirer/core';
import { Descriptor } from '../descriptor';
import { pad } from './core';

/** @see @inquirer/confirm/dist/cjs/types/index.d.ts */
type ConfirmConfig = AsyncPromptConfig & {
  message: string;
  default?: boolean;
  transformer?: (value: boolean) => string;
};

export type ReuseOptions<T extends Descriptor> = Partial<ConfirmConfig> & {
  description: string;
  reuse?: boolean;
  instance?: T;
  name?: string;
  purpose?: string;
};

export default {
  reuse: async function <T extends Descriptor>({
    description,
    reuse,
    instance,
    name,
    purpose,
    ...args
  }: ReuseOptions<T>) {
    if (instance) {
      if (reuse === false) {
        return undefined;
      } else if (
        reuse === undefined &&
        !(await cli.prompts.confirm({
          message: `Reuse existing ${description} ${cli.colors.value(
            name || ('name' in instance && instance.name) || ''
          )}${pad(purpose)}`,
          ...args
        }))
      ) {
        return undefined;
      }
    }
    return instance as T;
  }
};
