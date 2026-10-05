import { input as pInput } from '@inquirer/prompts';
import * as core from './core/index.js';

export async function input<T extends string>({
  arg,
  message,
  purpose,
  validate,
  ...options
}: input.Options) {
  return ((validate && validate(arg) === true && arg) ||
    (!validate && arg) ||
    (await pInput({
      message: `${message}${core.pad(purpose)}`,
      ...options
    }))) as T;
}

export namespace input {
  export type Options = {
    arg?: string;
    message: string;
    purpose?: string;
    default?: string;
    validate: (value?: string) => boolean | string;
  };
}
