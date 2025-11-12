import * as shell from '../../shell/index.js';
import { Version } from './Version.js';

export async function list({ secret }: { secret: string }) {
  return await shell.gcloud<Version[]>(`secrets versions list ${secret}`);
}
