import * as shell from '../../shell/index.js';
import { Version } from './Version.js';

export async function destroy({
  secret,
  version = 'latest'
}: {
  secret: string;
  version: string;
}) {
  await shell.gcloud<Version>(
    `secrets versions destroy ${version} --secret="${secret}"`
  );
}
