export type Flags = {
  [flag: string]: string | true | undefined;
  project?: string;
  quiet?: true;
  format?: string;
};
