import * as lib from '../../lib/index.js';
import * as shell from '../../shell/index.js';
import { Region } from './Region.js';

export { Region };

export async function describe({ region }: { region: string }) {
  return (
    await shell.gcloud<Region[], lib.Undefined.Value>(
      `app regions list --filter=region=${region}`,
      { error: lib.Undefined.callback }
    )
  )?.shift();
}

export async function list() {
  return await shell.gcloud<Region[]>('app regions list');
}

export async function selectRegion({
  region,
  ...rest
}: {
  region?: string;
} & Partial<lib.prompts.select.Parameters<Region, string>>) {
  return await lib.prompts.select<Region>({
    arg: region,
    argTransform: async (region: string) => await describe({ region }),
    message: `Google Cloud region`,
    choices: async () =>
      (await list()).map((r) => ({ name: r.region, value: r })),
    transform: (r: Region) => r.region,
    ...rest
  });
}

export const selectIdentifier = selectRegion;
