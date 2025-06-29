import { Colors } from '@battis/qui-cli.colors';
import { select as pSelect } from '@inquirer/prompts';
import _ from 'lodash';
import { Active } from '../Active.js';
import { Descriptor } from '../Descriptor.js';
import { confirm } from './confirm/index.js';
import * as core from './core/index.js';

export async function select<ChoiceType = string, ReturnType = string>({
  arg,
  argTransform,
  message,
  purpose,
  choices,
  validate = true,
  isEqual = _.isEqual,
  transform,
  active,
  create,
  activateIfCreated,
  ...rest
}: select.Parameters<ChoiceType, ReturnType>): Promise<ReturnType> {
  let selection: ChoiceType | undefined;

  // convert argument to valid selection, if possible
  if (arg) {
    if (argTransform) {
      selection = await argTransform(arg);
    } else {
      selection = arg as ChoiceType;
    }
  }

  // skip validation if requested
  if (selection && validate === false) {
    if (transform) {
      return await transform(selection);
    } else {
      return selection as unknown as ReturnType;
    }
  }

  // disqualify selection if invalidated
  if (selection && validate instanceof Function && !validate(arg)) {
    selection = undefined;
  }

  // load choices
  if (choices instanceof Promise) {
    choices = await choices;
  }
  if (choices instanceof Function) {
    choices = await choices();
  }

  // validate selection, if necessary
  if (selection && validate === true) {
    selection = choices.find((choice) =>
      isEqual(choice.value, selection as ChoiceType)
    )?.value;
  }

  // still no selection, but only a single choice
  if (!selection && choices.length === 1) {
    // can't create or choose to: reuse existing
    if (
      !create ||
      (await confirm({
        message: `${message}${core.pad(
          Colors.value(choices[0].name || choices[0].value)
        )}${core.pad(purpose)}`
      }))
    ) {
      selection = choices[0].value;
    } else {
      // create a new selection
      selection = await create(arg);
    }
  }

  // interactively make selection if not yet made
  if (!selection) {
    selection = await pSelect({
      message: `${message}${core.pad(purpose)}`,
      choices,
      validate,
      ...rest
    });
  }

  // activate selection if necessary
  if (active) {
    active.activate(selection);
  }

  // transform selection if necessary
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
          argTransform: Transform<string, ChoiceType | undefined>;
        }) & {
      message: string;
      choices: Choices<ChoiceType>;
      validate?: boolean | ((value?: string) => boolean | string);
      isEqual?: (a: ChoiceType, b: ChoiceType) => boolean;
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
