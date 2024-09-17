import * as shell from '../../shell';
import Version from './Version';

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

export async function list({ secret }: { secret: string }) {
  return await shell.gcloud<Version[]>(`secrets versions list ${secret}`);
}

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

export { type Version };
