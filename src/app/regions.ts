import lib from '../lib';
import { SelectOptions } from '../lib/prompts/select';
import shell from '../shell';

type Region = {
  flexible: boolean;
  region: string;
  search_api: boolean;
  standard: boolean;
};

type SelectIdentifierOptions = Partial<SelectOptions> & {
  region?: string;
};

const list = async () => shell.gcloud<Region[]>('app regions list');

export default {
  list,

  selectIdentifier: async function(options?: SelectIdentifierOptions) {
    const { region, ...rest } = options;
    return await lib.prompts.select({
      arg: region,
      message: `Google Cloud region`,
      choices: list,
      valueIn: 'region',
      ...rest
    });
  }
};
