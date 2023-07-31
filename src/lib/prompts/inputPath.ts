import cli from '@battis/qui-cli';
import fs from 'fs';
import { pad } from './core';
import input, { InputOptions } from './input';

type Path = string;

export type PathOptions = Partial<InputOptions<Path>> & {
  path?: Path;
};

export default async function inputPath(options?: PathOptions) {
  const { message, arg, path, purpose, ...rest } = options;
  return input({
    arg: path,
    message:
      (message && `${message}${pad(purpose)}`) || `Path to ${pad(purpose)}`,
    validate: (value: string) =>
      fs.existsSync(value) || `${value} does not exist`,
    default: cli.appRoot(),
    ...rest
  });
}
