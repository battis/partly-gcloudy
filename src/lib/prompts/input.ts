import { input as pInput } from '@inquirer/prompts';
import * as core from './core/index.js';

export async function input<T extends string>({
  arg,
  message,
  purpose,
  validate,
  ...rest
}: {
  arg?: string;
  message: string;
  purpose?: string;
  default?: string;
  validate: (value?: string) => boolean | string;
}) {
  return (
    (validate && validate(arg) === true && arg) ||
    (!validate && arg) ||
    (await pInput({
      message: `${message}${core.pad(purpose)}`,
      ...rest
    }))
  );
}
