import * as lib from '../../lib';
import * as shell from '../../shell';
import Tier from './Tier';

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
    message: `Cloud SQL service tier}`,
    choices: async () =>
      (
        await list()
      ).map((t) => ({
        name: t.tier,
        value: t,
        description: t.DiskQuota
      })),
    transform: (t: Tier) => t.tier
  });
}

export const selectIdentifier = selectTier;

export { type Tier };
