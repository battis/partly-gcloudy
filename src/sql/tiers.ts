import lib from '../lib';
import { SelectOptions } from '../lib/prompts';
import shell from '../shell';

type Tier = {
  DiskQuota: string;
  RAM: string;
  kind: string;
  region: string[];
  tier: string;
};

async function list() {
  return shell.gcloud<Tier[]>('sql tiers list');
}

type SelectTierOptions = Partial<SelectOptions> & {
  tier?: string;
};

async function selectTier(options?: SelectTierOptions) {
  const { tier } = options;
  return await lib.prompts.select({
    arg: tier,
    message: `Cloud SQL service tier}`,
    choices: list,
    valueIn: 'tier'
  });
}

export default {
  list,
  selectTier,
  selectIdentifier: selectTier
};
