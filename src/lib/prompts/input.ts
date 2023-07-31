import cli from '@battis/qui-cli';
import { AsyncPromptConfig } from '@inquirer/core';
import { PromptConfig, pad } from './core';

/** @see @inquirer/input/dist/cjs/types/index.d.ts */
type InputConfig<T extends string> = AsyncPromptConfig &
  PromptConfig & {
    default?: string;
    transformer?: (
      value: string,
      {
        isFinal
      }: {
        isFinal: boolean;
      }
    ) => T;
  };

export type InputOptions<T extends string> = InputConfig<T> &
  PromptConfig & {
    arg: string;
  };

export default async function input<T extends string>({
  arg,
  message,
  purpose,
  validate,
  ...rest
}: InputOptions<T>) {
  return ((validate && validate(arg) === true && arg) ||
    (!validate && arg) ||
    (await cli.prompts.input({
      message: message && `${message}${pad(purpose)}`,
      validate,
      ...rest
    }))) as T;
}
