import cli from '@battis/qui-cli';
import { AsyncPromptConfig } from '@inquirer/core';
import { Descriptor } from '../descriptor';
import { PromptConfig, pad } from './core';

/** @see {@link https://github.com/SBoudrias/Inquirer.js/blob/6ad9cca5bb5102c3fb623aca9795ea3e8ecbf8c8/packages/input/src/index.mts#L13-L16 | @inquirer/input} */
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
    arg?: string;
    instance?: Descriptor;
    nameIn?: string;
    name?: string;
  };

/**
 * Prompt user to input a value
 * @param options
 * - `arg?: string` caller-provided argument to validate and return (if
 *   defined and valid)
 * - `message: string` for user prompt
 * - `purpose?: string` appended to message if defined
 * - `default?: string` value to suggest to user
 * - `validate?: (value?: string) => boolean | string | Promise<boolean | string>` callback to validate user-entered values
 * - `instance?: Descriptor` if defined, validation requires user input _not_ to match `instance.name`, or `instance[nameIn]`
 * - `nameIn?: string` property name in `instance` not to match (default `'name'`)
 * - `name?: string` if defined, validation requires user input not to match `name`
 * - `transformer?: (value: string) => T` callback to transform user entry into return value
 * @returns `arg` if defined and valid or validated user-entered value
 */
export default async function input<T extends string>({
  arg,
  message,
  purpose,
  default: _default,
  instance,
  name,
  nameIn = 'name',
  validate,
  ...rest
}: InputOptions<T>) {
  return ((validate && validate(arg) === true && arg) ||
    (!validate && arg) ||
    (await cli.prompts.input({
      message: message && `${message}${pad(purpose)}`,
      default: _default || name || (instance && instance[nameIn]) || undefined,
      validate: (value?: string) =>
        (validate(value) &&
          (!name || name !== value) &&
          (!instance || instance[nameIn || 'name'] !== value)) ||
        `Cannot reuse ${nameIn || 'name'} ${cli.colors.value(value)}`,
      ...rest
    }))) as T;
}
