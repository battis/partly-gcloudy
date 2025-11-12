import * as shell from '../../shell/index.js';
import { Version } from './Version.js';

export async function describe({
  secret,
  version = 'latest'
}: {
  secret: string;
  version: string;
}) {
  return await shell.gcloud<Version>(
    `secrets versions ${version} --secret="${secret}"`
  );
}
