import cli from '@battis/qui-cli';
import { AsyncPromptConfig } from '@inquirer/core';
import { Context } from '@inquirer/type';
import { Descriptor } from '../descriptor';
import { PromptConfig } from './core';

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

export type SelectOptions = SelectConfig &
  PromptConfig & {
    choices: () => Descriptor[] | Promise<Descriptor[]>;
    pageSize?: number | undefined;
    valueIn?: string;
    nameIn?: string;
  };

const toChoice =
  ({ nameIn, valueIn }: ToChoiceOptions) =>
    (descriptor: Descriptor): Choice<string> => ({
      name: descriptor[nameIn].toString(),
      value: descriptor[valueIn].toString()
    });

const select = async (
  { arg, choices, nameIn, valueIn = 'name', ...rest }: SelectOptions,
  context?: Context
) =>
  arg ||
  (await cli.prompts.select(
    {
      choices: (
        await choices()
      ).map(toChoice({ nameIn: nameIn || valueIn, valueIn })),
      ...rest
    },
    context
  ));

export default select;
