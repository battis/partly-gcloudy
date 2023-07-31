import cli from '@battis/qui-cli';
import { AsyncPromptConfig } from '@inquirer/core';
import { PromptConfig } from './core';

/** @see @inquirer/confirm/dist/cjs/types/index.d.ts */
type ConfirmConfig = AsyncPromptConfig & {
  message: string;
  default?: boolean;
  transformer?: (value: boolean) => string;
};

export type ConfirmOptions = ConfirmConfig &
  PromptConfig & {
    arg?: boolean;
  };

export default async function confirm({ arg, ...rest }: ConfirmOptions) {
  return (arg !== undefined && arg) || (await cli.prompts.confirm(rest));
}
