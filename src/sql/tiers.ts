import * as lib from '../lib.js';
import * as shell from '../shell.js';
import { Tier } from './tiers/Tier.js';

export { Tier };

export async function describe({ tier }: { tier: string }) {
  return (
    await shell.gcloud<Tier[], lib.Undefined.Value>(
      `sql tiers list --filter=tier=${tier}`,
      { error: lib.Undefined.callback }
    )
  )?.shift();
}

export async function list() {
  return await shell.gcloud<Tier[]>('sql tiers list');
}

export async function selectTier({
  tier
}: Partial<lib.prompts.select.Parameters<Tier>> & {
  tier?: string;
} = {}) {
  return await lib.prompts.select<Tier>({
    arg: tier,
    argTransform: async (tier) => await describe({ tier }),
    message: `Cloud SQL service tier}`,
    choices: async () =>
      (await list()).map((t) => ({
        name: t.tier,
        value: t,
        description: t.DiskQuota
      })),
    transform: (t: Tier) => t.tier
  });
}

export const selectIdentifier = selectTier;
