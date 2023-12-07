import cli from '@battis/qui-cli';
import Active from '../../Active';
import Descriptor from '../../Descriptor';
import * as core from '../core';
import Choice from './Choice';

export async function select({
  arg,
  message,
  purpose,
  choices,
  validate,
  transform
}: select.Parameters<string>): Promise<string>;

export async function select<Value extends Descriptor>({
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
}: select.Parameters<string, Value>): Promise<string>;

export async function select<Value extends Descriptor, ReturnValue = string>({
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
}: select.Parameters<Value, ReturnValue>): Promise<ReturnValue>;

export async function select<Value, ReturnValue = string>({
  arg,
  argTransform,
  message,
  purpose,
  choices: choicesArg,
  validate = true,
  transform,
  activate,
  create,
  activateIfCreated,
  ...rest
}: select.Parameters<Value, ReturnValue>): Promise<ReturnValue> {
  let choices: Choice<Value>[];
  const preload = async () =>
    choices ||
    (choices =
      typeof choicesArg === 'function' ? await choicesArg() : await choicesArg);
  let selection: Value | undefined;
  if (arg) {
    if (validate === false) {
      selection = argTransform
        ? await argTransform(arg)
        : (arg as unknown as Value);
    } else if (validate === true) {
      choices = await preload();
      selection = choices.find((choice) =>
        transform ? transform(choice.value) : choice.value === arg
      )?.value;
    } else if (typeof validate === 'function' && validate(arg) === true) {
      selection = argTransform
        ? await argTransform(arg)
        : (arg as unknown as Value);
    }
  }
  choices = await preload();
  if (choices.length === 1) {
    const choice = choices.shift();
    selection = choice?.value;
    if (
      choice &&
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
      selection = await create({
        activate: activateIfCreated === true || activateIfCreated === undefined,
        ...rest
      });
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

export namespace select {
  export type Parameters<
    Value = string,
    ReturnValue = string
  > = core.Parameters & {
    argTransform?: Value extends Descriptor ? Transform<string, Value> : never;
    message: string;
    choices: Choices<Value>;
    validate?: boolean | ((value?: string) => boolean | string);
    transform?: Transform<Value, ReturnValue>;
    activate?: Value extends Descriptor ? Active<Value> : never;
    create?: Value extends Descriptor ? Create<Value> : never;
    activateIfCreated?: Value extends Descriptor ? boolean : never;
  };

  export type Choices<Value> =
    | Choice<Value>[]
    | Promise<Choice<Value>[]>
    | (() => Choice<Value>[])
    | (() => Promise<Choice<Value>[]>);

  export type Transform<A, B> = (value: A) => B | Promise<B>;

  // FIXME this should be defined in core, yes?
  export type Create<Value> = (
    parameters?: Record<string, any>
  ) => Value | Promise<Value>;
}

export default select;
