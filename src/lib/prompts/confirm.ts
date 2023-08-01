import cli from '@battis/qui-cli';
import { AsyncPromptConfig } from '@inquirer/core';
import { PromptConfig } from './core';

/** @see {@link https://github.com/SBoudrias/Inquirer.js/blob/6ad9cca5bb5102c3fb623aca9795ea3e8ecbf8c8/packages/confirm/src/index.mts#L12-L16 | @inquirer/confirm} */
type ConfirmConfig = AsyncPromptConfig & {
  message: string;
  default?: boolean;
  transformer?: (value: boolean) => string;
};

export type ConfirmOptions = ConfirmConfig &
  PromptConfig & {
    arg?: boolean;
  };

/**
 * Prompt user to confirm statement
 * @param options
 * - `arg?: boolean` caller-provided argument to return (if defined)
 * - `message: string` for user prompt
 * - `purpose?: string` appended to message if defined
 * - `default?: boolean` value to suggest to user
 * - `transformer?: (value: boolean) => string` callback to transform boolean
 *   result into string value
 * @returns `arg` (if defined) or user confirmation
 */
export default async function confirm({ arg, ...rest }: ConfirmOptions) {
  return (arg !== undefined && arg) || (await cli.prompts.confirm(rest));
}
