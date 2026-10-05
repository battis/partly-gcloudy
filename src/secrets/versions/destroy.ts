import { gcloud } from '#shell';
import { Version } from './Version.js';

type Options = {
  secret: string;
  version: string;
};

export async function destroy({ secret, version = 'latest' }: Options) {
  await gcloud<Version>(`secrets versions destroy ${version}`, {
    flags: { secret }
  });
}
