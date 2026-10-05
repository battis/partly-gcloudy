import * as shell from '#shell';
import { Version } from './Version.js';

export async function list({
  sortBy = '~version.createTime'
}: list.Options = {}) {
  return await shell.gcloud<Version[]>('app versions list', {
    flags: { 'sort-by': sortBy }
  });
}

export namespace list {
  export type Options = { sortBy?: string };
}
