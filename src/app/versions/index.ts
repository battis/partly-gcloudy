import * as shell from '../../shell/index.js';
import { Version } from './Version.js';

export { Version };

export async function list({
  sortBy = '~version.createTime'
}: {
  sortBy?: string;
} = {}) {
  return await shell.gcloud<Version[]>('app versions list', {
    flags: { 'sort-by': sortBy }
  });
}

export async function delete_({ version }: { version: string }) {
  return await shell.gcloud<Version>(`app versions delete ${version}`);
}
