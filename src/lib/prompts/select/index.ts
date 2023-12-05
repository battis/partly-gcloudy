import cli from '@battis/qui-cli';
import Active from '../../Active';
import Descriptor from '../../Descriptor';
import * as core from '../core';
import TChoice from './Choice';

type Base = core.Parameters & {
  message: string;
  validate?: boolean | ((value: string) => boolean | string);
};

type Choices<Value> =
  | select.Choice<Value>[]
  | Promise<select.Choice<Value>[]>
  | (() => select.Choice<Value>[])
  | (() => Promise<select.Choice<Value>[]>);

type Transform<A, B> = (value: A) => B | Promise<B>;

type Create<Value> = (
  parameters?: Record<string, any>
) => Value | Promise<Value>;

async function select({
  arg,
  message,
  purpose,
  choices,
  validate,
  transform
}: select.Parameters.StringToString): Promise<string>;

async function select<Value>({
  arg,
  argTransform,
  message,
  purpose,
  choices,
  validate,
  transform,
  activate,
  create,
  activateIfCreated
}: select.Parameters.ValueToString<Value>): Promise<string>;

async function select<Value, ReturnValue>({
  arg,
  argTransform,
  message,
  purpose,
  choices,
  validate,
  transform,
  activate,
  create,
  activateIfCreated,
  ...rest
}: select.Parameters.ValueToValue<Value, ReturnValue>): Promise<ReturnValue>;

async function select<Value, ReturnValue = string>({
  arg,
  argTransform,
  message,
  purpose,
  choices: choicesArg,
  validate = true,
  transform,
  activate,
  create,
  activateIfCreated = true,
  ...rest
}: select.Parameters.Implementation<Value, ReturnValue>): Promise<ReturnValue> {
  let choices: select.Choice<Value>[];
  const preload = async () =>
    choices ||
    (choices =
      typeof choicesArg === 'function' ? await choicesArg() : await choicesArg);
  let selection: Value;
  if (arg) {
    if (validate === false) {
      selection = argTransform
        ? await argTransform(arg)
        : (arg as unknown as Value);
    } else if (validate === true) {
      await preload();
      if (
        choices.find((choice) =>
          transform ? transform(choice.value) : choice.value === arg
        )
      ) {
        selection = argTransform
          ? await argTransform(arg)
          : (arg as unknown as Value);
      }
    } else if (typeof validate === 'function' && validate(arg) === true) {
      selection = argTransform
        ? await argTransform(arg)
        : (arg as unknown as Value);
    }
  }
  await preload();
  if (choices.length === 1) {
    const choice = choices.shift();
    selection = choice.value;
    if (
      !(await cli.prompts.confirm({
        message: `${message} ${cli.colors.value(
          choice.name || choice.value
        )}${core.pad(purpose)}`
      }))
    ) {
      selection = undefined;
    }
  }
  if (choices.length === 0) {
    if (create) {
      selection = await create({ activate: activateIfCreated, ...rest });
    }
  }
  selection =
    selection ||
    (await cli.prompts.select({
      message: `${message}${core.pad(purpose)}`,
      choices
    }));
  if (activate) {
    activate.activate(selection);
  }
  return transform
    ? await transform(selection)
    : (selection as unknown as ReturnValue); // TODO is there a more elegant way to phrase this?
}

namespace select {
  export type Choice<Value> = TChoice<Value>;
  export namespace Parameters {
    export type StringToString = Base & {
      choices: Choices<string>;
      transform?: Transform<string, string>;
    };
    export type ValueToString<Value> = Base & {
      argTransform?: Transform<string, Value>;
      choices: Choices<Value>;
      transform: Transform<Value, string>;
      activate?: Active<Value>;
      create?: Create<Value>;
      activateIfCreated?: boolean;
    };
    export type ValueToValue<Value, ReturnValue> = Base & {
      argTransform: Transform<string, Value>;
      choices: Choices<Value>;
      transform: Transform<Value, ReturnValue>;
      activate?: Active<Value>;
      create?: Create<Value>;
      activateIfCreated?: boolean;
    };
    export type Implementation<Value, ReturnValue> = Base & {
      argTransform?: Transform<string, Value>;
      message: string;
      choices: Choices<Value>;
      validate?: boolean | ((value?: string) => boolean | string);
      transform?: Transform<Value, ReturnValue>;
      activate?: Value extends Descriptor ? Active<Value> : never;
      create?: Value extends Descriptor ? (parameters: object) => Value : never;
      activateIfCreated?: Value extends Descriptor ? boolean : never;
    };
  }
}

export default select;
