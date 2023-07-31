import cli from '@battis/qui-cli';
import { AsyncPromptConfig } from '@inquirer/core';
import { Context } from '@inquirer/type';
import { Descriptor } from '../descriptor';
import { PromptConfig, pad } from './core';

/**
 * @see @inquirer/select/dist/cjs/types/index.d.ts
 */
type Choice<Value> = {
  value: Value;
  name?: string;
  description?: string;
  disabled?: boolean | string;
  type?: never;
};

/**
 * @see @inquirer/select/dist/cjs/types/index.d.ts
 */
type SelectConfig /*<Value>*/ = AsyncPromptConfig & {
  // unneeded because we're going to redefine it in a sec
  // choices: readonly (Separator | Choice<Value>)[];
  pageSize?: number | undefined;
};

type ToChoiceOptions = {
  nameIn: string;
  valueIn: string;
};

export type SelectOptions<T extends string> = SelectConfig &
  PromptConfig & {
    arg: string;
    choices: () => Descriptor[] | Promise<Descriptor[]>;
    pageSize?: number | undefined;
    valueIn?: string;
    nameIn?: string;
    validate?: boolean | ((arg: string) => boolean);
  };

const toChoice =
  <T extends string>({ nameIn, valueIn }: ToChoiceOptions) =>
    (descriptor: Descriptor): Choice<T> => ({
      name: descriptor[nameIn].toString(),
      value: descriptor[valueIn].toString()
    });

export default async function select<T extends string>(
  {
    arg,
    validate,
    message,
    purpose,
    choices,
    nameIn,
    valueIn = 'name',
    ...rest
  }: SelectOptions<T>,
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
