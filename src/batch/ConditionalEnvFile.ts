import { JSONPrimitiveTypes } from '@battis/typescript-tricks';

export type ConditionalEnvFile =
  | boolean
  | string
  | {
      path?: string;
      keys: { [param: string]: string };
    };
export type { ConditionalEnvFile as default };

export type ParsedValue = string | JSONPrimitiveTypes;
