import { gcloud } from '#shell';
import { Version } from './Version.js';

export async function list({ secret }: { secret: string }) {
  return await gcloud<Version[]>(`secrets versions list ${secret}`);
}
