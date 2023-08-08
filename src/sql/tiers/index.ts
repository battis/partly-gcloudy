import lib from '../../lib';
import shell from '../../shell';
import TTier from './Tier';

class tiers {
  protected constructor() {
    // ignore
  }
  public static list() {
    return shell.gcloud<tiers.Tier[]>('sql tiers list');
  }

  public static async selectTier({
    tier
  }: Partial<lib.prompts.select.Parameters.ValueToString<tiers.Tier>> & {
    tier?: string;
  } = undefined) {
    return await lib.prompts.select<tiers.Tier>({
      arg: tier,
      message: `Cloud SQL service tier}`,
      choices: () =>
        this.list().map((t) => ({
          name: t.tier,
          value: t,
          description: t.DiskQuota
        })),
      transform: (t: tiers.Tier) => t.tier
    });
  }

  public static selectIdentifier = this.selectTier;
}

namespace tiers {
  export type Tier = TTier;
}

export { tiers as default };
