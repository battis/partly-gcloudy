import { gcloud } from '#shell';
import { Version } from './Version.js';

export async function destroy({
  secret,
  version = 'latest'
}: {
  secret: string;
  version: string;
}) {
  await gcloud<Version>(
    `secrets versions destroy ${version} --secret="${secret}"`
  );
}
