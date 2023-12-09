import cli from '@battis/qui-cli';
import Active from '../Active';
import Descriptor from '../Descriptor';
import * as core from './core';

export async function select<ChoiceType = string, ReturnType = string>({
  arg,
  argTransform,
  message,
  purpose,
  choices,
  validate = true,
  transform,
  active,
  create,
  activateIfCreated,
  ...rest
}: select.Parameters<ChoiceType, ReturnType>): Promise<ReturnType> {
  let selection: ChoiceType | undefined;

  // handle a potential initial argument
  if (arg) {
    if (argTransform) {
      selection = await argTransform(arg);
    } else {
      selection = arg as ChoiceType;
    }
    if (selection && !validate) {
      if (transform) {
        return transform(selection);
      }
      return selection as ReturnType;
    }
  }

  // load choices
  if (choices instanceof Promise) {
    choices = await choices;
  }
  if (choices instanceof Function) {
    choices = await choices();
  }

  // validate selection, if possible
  if (selection) {
    if (validate === true) {
      selection = choices.find(
        (choice: select.Choice<ChoiceType>) => choice.value == selection
      )?.value;
    } else if (validate instanceof Function) {
      selection = validate(arg) === true ? selection : undefined;
    }
  }

  // create if necessary
  if (create && !selection) {
    selection = await create(arg);
    if (activateIfCreated && active) {
      active.activate(selection);
    }
  }

  // interactively make selection
  selection =
    selection ||
    (await cli.prompts.select({
      message: `${message}${core.pad(purpose)}`,
      choices
    }));

  // activate if necessary
  if (active) {
    active.activate(selection);
  }

  // transform if necessary
  if (transform) {
    return await transform(selection);
  } else {
    return selection as unknown as ReturnType;
  }
}

export namespace select {
  export type Parameters<
    ChoiceType = string,
    ReturnType = string
  > = core.Parameters &
    (ChoiceType extends string
      ? { argTransform?: never }
      : {
          argTransform: (
            arg: string
          ) => ChoiceType | Promise<ChoiceType | undefined> | undefined;
        }) & {
      message: string;
      choices: Choices<ChoiceType>;
      validate?: boolean | ((value?: string) => boolean | string);
      transform?: Transform<ChoiceType, ReturnType>;
      active?: ChoiceType extends Descriptor ? Active<ChoiceType> : never;
      create?: ChoiceType extends Descriptor ? Create<ChoiceType> : never;
      activateIfCreated?: ChoiceType extends Descriptor ? boolean : never;
    } & (ChoiceType extends ReturnType
      ? { transform?: never }
      : { transform: Transform<ChoiceType, ReturnType> });
  export type Choice<ChoiceType = string> = (ChoiceType extends string
    ? { name?: string }
    : { name: string }) & {
    description?: string;
    value: ChoiceType;
    disabled?: boolean;
  };

  export type Choices<ChoiceType = string> =
    | Choice<ChoiceType>[]
    | Promise<Choice<ChoiceType>[]>
    | (() => Choice<ChoiceType>[])
    | (() => Promise<Choice<ChoiceType>[]>);

  export type Transform<A, B> = (value: A) => B | Promise<B>;

  // FIXME this should be defined in core, yes?
  export type Create<ChoiceType extends Descriptor> = (
    arg?: string
  ) => ChoiceType | Promise<ChoiceType>;
}

export default select;
