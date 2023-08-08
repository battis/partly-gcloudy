import lib from '../../lib';
import shell from '../../shell';
import TRegion from './Region';

class regions {
  protected constructor() {
    // ignore
  }

  public static list() {
    return shell.gcloud<regions.Region[]>('app regions list');
  }

  public static async selectRegion({
    region,
    ...rest
  }: {
    region?: string;
  } & Partial<lib.prompts.select.Parameters.ValueToString<regions.Region>>) {
    return await lib.prompts.select<regions.Region>({
      arg: region,
      message: `Google Cloud region`,
      choices: () => this.list().map((r) => ({ name: r.region, value: r })),
      transform: (r: regions.Region) => r.region,
      ...rest
    });
  }

  public static selectIdentifier = this.selectRegion;
}

namespace regions {
  export type Region = TRegion;
}

export { regions as default };
