import { gcloud } from '#shell';
import { Version } from './Version.js';

type Options = {
  secret: string;
  version: string;
};

export async function describe({ secret, version = 'latest' }: Options) {
  return await gcloud<Version>(`secrets versions ${version}`, {
    flags: { secret }
  });
}
