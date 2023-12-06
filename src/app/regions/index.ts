import * as lib from '../../lib';
import * as shell from '../../shell';
import Region from './Region';

export async function list() {
  return shell.gcloud<Region[]>('app regions list');
}

export async function selectRegion({
  region,
  ...rest
}: {
  region?: string;
} & Partial<lib.prompts.select.Parameters<Region, string>>) {
  return await lib.prompts.select<Region>({
    arg: region,
    message: `Google Cloud region`,
    choices: async () =>
      (await list()).map((r) => ({ name: r.region, value: r })),
    transform: (r: Region) => r.region,
    ...rest
  });
}

export const selectIdentifier = selectRegion;
