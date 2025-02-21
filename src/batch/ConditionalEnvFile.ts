import { Env } from '@battis/qui-cli.env';
import { Root } from '@battis/qui-cli.root';
import { JSONPrimitiveTypes } from '@battis/typescript-tricks';
import path from 'node:path';

export type ConditionalEnvFile =
  | boolean
  | string
  | {
      path?: string;
      keys: { [param: string]: string };
    };
export type { ConditionalEnvFile as default };

export type ParsedValue = string | JSONPrimitiveTypes;

let parsed: Record<string, ParsedValue> = {};
let file: string | undefined;

function pathToEnvFile({
  env,
  root = Root.path()
}: {
  env: ConditionalEnvFile;
  root?: string;
}) {
  if (!env) {
    file = undefined;
  } else if (env === true) {
    file = path.resolve(root, '.env');
  } else if (typeof env === 'string') {
    file = path.resolve(root, env);
  } else if (env?.path) {
    file = path.resolve(root, env.path);
  }
  return file;
}

export function readEnvFile({
  env,
  parsePrimitives = true
}: {
  env: ConditionalEnvFile;
  parsePrimitives?: boolean;
}): Record<string, ParsedValue> {
  const path = pathToEnvFile({ env });
  if (path) {
    parsed = Env.parse(path);
    if (parsePrimitives) {
      for (const key in parsed) {
        try {
          const value = JSON.parse(parsed[key] as string);
          if (typeof value !== 'object') {
            parsed[key] = value;
          }
        } catch (e) {
          // ignore
        }
      }
    }
    return parsed;
  }
  return {};
}

export function writeEnvFile({ env }: { env: Record<string, ParsedValue> }) {
  if (!file)
    throw new Error(
      '.env file path not defined (readEnvFile() before writeEnvFile())'
    );
  for (const key in env) {
    if (env[key] !== parsed[key]) {
      Env.set({ key, value: env[key]!.toString(), file });
    }
  }
}
