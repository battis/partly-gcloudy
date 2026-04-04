import { gcloud } from '#shell';
import { Version } from './Version.js';

export async function describe({
  secret,
  version = 'latest'
}: {
  secret: string;
  version: string;
}) {
  return await gcloud<Version>(
    `secrets versions ${version} --secret="${secret}"`
  );
}
