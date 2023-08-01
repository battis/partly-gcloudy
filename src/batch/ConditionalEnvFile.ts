export type ConditionalEnvFile =
  | boolean
  | string
  | {
    path?: string;
    keys: { [param: string]: string }[];
  };
