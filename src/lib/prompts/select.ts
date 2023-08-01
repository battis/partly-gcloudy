import cli from '@battis/qui-cli';
import { AsyncPromptConfig } from '@inquirer/core';
import { Context } from '@inquirer/type';
import { Descriptor } from '../descriptor';
import { PromptConfig, pad } from './core';

/** @see {@link https://github.com/SBoudrias/Inquirer.js/blob/6ad9cca5bb5102c3fb623aca9795ea3e8ecbf8c8/packages/select/src/index.mts#L20-L26 | @inquirer/select} */
type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  disabled?: boolean | string;
  type?: never;
};

/** @see {@link https://github.com/SBoudrias/Inquirer.js/blob/6ad9cca5bb5102c3fb623aca9795ea3e8ecbf8c8/packages/select/src/index.mts#L28-L31 | @inquirer/select} */
type SelectConfig /*<Value>*/ = AsyncPromptConfig & {
  // unneeded because we're going to redefine it in a sec
  // choices: readonly (Separator | Choice<Value>)[];
  pageSize?: number | undefined;
};

type ToChoiceOptions = {
  nameIn: string;
  valueIn: string;
};

export type SelectOptions = SelectConfig &
  PromptConfig &
  Partial<ToChoiceOptions> & {
    arg: string;
    choices: () => Descriptor[] | Promise<Descriptor[]>;
    validate?: boolean | ((value: string) => boolean);
  };

const toChoice =
  <T extends string>({ nameIn, valueIn }: ToChoiceOptions) =>
    (descriptor: Descriptor): Choice<T> => ({
      name: descriptor[nameIn].toString(),
      value: descriptor[valueIn].toString()
    });

/**
 * Prompt user to select from a list of values
 * @param options
 * - `arg?: string` caller-provided argument to validate and return (if
 *   defined and valid)
 * - `message: string` for user prompt
 * - `purpose?: string` appended to message if defined
 * - `choices: () => Descriptor[] | Promise<Descriptor[]>` callback to list
 *   choices, if arg not defined and valid
 * - `valueIn?: string` name of `Descriptor` property containing `Choice`
 *   value (default `'name'`)
 * - `nameIn?: string` name of `Descriptor` property containing `Choice` name
 *   (default `valueIn`)
 * - `validate?: boolean | ((value: string) => boolean)` whether to validate
 *   `arg`. If `true`, `arg` must exist in `choices` result. If a callback,
 *   callback result validates `arg`
 * @returns `arg` (if defined and valid) or user selection from `choices` callback
 */
export default async function select<T extends string>(
  {
    arg,
    message,
    purpose,
    choices,
    nameIn,
    valueIn = 'name',
    validate,
    ...rest
  }: SelectOptions,
  context?: Context
) {
  let cachedChoices: Choice<T>[];
  if (validate && arg) {
    if (validate === true) {
      cachedChoices = (await choices()).map(
        toChoice<T>({ nameIn: nameIn || valueIn, valueIn })
      );
      if (cachedChoices.filter((choice) => choice.value === arg).length) {
        return arg;
      }
    } else if (typeof validate === 'function' && validate(arg)) {
      return arg;
    }
  }
  return (arg ||
    (await cli.prompts.select<T>(
      {
        message: `${message}${pad(purpose)}`,
        choices:
          cachedChoices ||
          (
            await choices()
          ).map(toChoice<T>({ nameIn: nameIn || valueIn, valueIn })),
        ...rest
      },
      context
    ))) as T;
}
