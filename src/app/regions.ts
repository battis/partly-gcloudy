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
  purpose?: string;
};

const list = async () => shell.gcloud<Region[]>('app regions list');

export default {
  list,

  selectIdentifier: async function(options?: SelectIdentifierOptions) {
    const { region, purpose = 'operate', ...rest } = options;
    return await lib.prompts.select({
      arg: region,
      message: `Google Cloud region${lib.prompts.pad(purpose)}`,
      choices: list,
      valueIn: 'region',
      ...rest
    });
  }
};
