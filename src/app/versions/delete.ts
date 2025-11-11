import * as shell from '../../shell/index.js';
import { Version } from './Version.js';

export async function delete_({ version }: { version: string }) {
  return await shell.gcloud<Version>(`app versions delete ${version}`);
}
