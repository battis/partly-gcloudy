import { gcloud } from '#shell';
import { Version } from './Version.js';

type Options = {
  secret: string;
};

export async function list({ secret }: Options) {
  return await gcloud<Version[]>(`secrets versions list ${secret}`);
}
