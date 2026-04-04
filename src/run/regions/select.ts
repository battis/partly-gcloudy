import * as lib from '#lib';
import { Region } from './Region.js';
import * as List from './list.js';

type Options = { region?: Region['locationId'] } & List.Options &
  Partial<lib.prompts.select.Parameters<Region, string>>;

export async function select({ region, ...rest }: Options) {
  return await lib.prompts.select<Region>({
    arg: region,
    argTransform: async (region: string) =>
      (await List.list({ ...rest }))
        .filter((r) => r.locationId === region)
        .shift(),
    message: 'Google Cloud region',
    choices: async () =>
      (await List.list()).map((r) => ({
        name: `${r.locationId} (${r.displayName})`,
        value: r
      })),
    transform: (r: Region) => r.locationId,
    ...rest
  });
}
