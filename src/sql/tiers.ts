import lib from '../lib';
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
export default {
  list,

  selectIdentifier: async (tier?: string) =>
    await lib.prompts.select({
      arg: tier,
      message: `Cloud SQL service tier}`,
      choices: list,
      valueIn: 'tier'
    })
};
