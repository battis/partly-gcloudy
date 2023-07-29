import cli from '@battis/qui-cli';
import { AsyncPromptConfig } from '@inquirer/core';
import fs from 'fs';
import { pad } from './core';

/** @see @inquirer/input/dist/cjs/types/index.d.ts */
export type InputConfig = AsyncPromptConfig & {
  default?: string;
  transformer?: (
    value: string,
    {
      isFinal
    }: {
      isFinal: boolean;
    }
  ) => string;
};

export type PathOptions = Partial<InputConfig> & {
  path?: string;
  purpose: string;
};

export default {
  path: async function(options?: PathOptions) {
    const { path, purpose, ...rest } = options;
    return (
      path ||
      (await cli.prompts.input({
        message: `Path to ${pad(purpose)}`,
        validate: (value: string) =>
          fs.existsSync(value) || `${value} does not exist`,
        default: cli.appRoot(),
        ...rest
      }))
    );
  }
};
