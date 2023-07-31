import cli from '@battis/qui-cli';
import lib from '../lib';
import { InputOptions } from '../lib/prompts';

type IamRole = string;

type InputIdentifierOptions = Partial<InputOptions<IamRole>> & {
  role?: string;
};

export default {
  Owner: 'roles/owner',
  CloudSQL: {
    Client: 'roles/cloudsql.client'
  },

  inputIdentifier: async function(options?: InputIdentifierOptions) {
    const { role, ...rest } = options;
    return await lib.prompts.input({
      arg: role,
      message: 'IAM role',
      validate: cli.validators.notEmpty,
      ...rest
    });
  }
};
