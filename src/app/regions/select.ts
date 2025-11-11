import * as lib from '../../lib/index.js';
import { describe } from './describe.js';
import { list } from './list.js';
import { Region } from './Region.js';

export async function select({
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
