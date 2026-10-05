import * as shell from '#shell';
import { Version } from './Version.js';

export async function delete_({ version }: delete_.Options) {
  return await shell.gcloud<Version>(`app versions delete ${version}`);
}

export namespace delete_ {
  export type Options = { version: string };
}
