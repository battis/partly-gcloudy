import cli from '@battis/qui-cli';
import { JSONPrimitiveTypes } from '@battis/typescript-tricks';
import appRootPath from 'app-root-path';
import path from 'path';

type ConditionalEnvFile =
  | boolean
  | string
  | {
      path?: string;
      keys: { [param: string]: string };
    };
export type { ConditionalEnvFile as default };

type ParsedValue = string | JSONPrimitiveTypes;

let parsed: Record<string, ParsedValue> = {};
let file: string | undefined;

function pathToEnvFile({
  env,
  root = appRootPath.toString()
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
    parsed = cli.env.parse(path);
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
      cli.env.set({ key, value: env[key]!.toString(), file });
    }
  }
}
