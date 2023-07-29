import cli from '@battis/qui-cli';
import lib from '../lib';
import { InputConfig } from '../lib/prompts/input';

type InputIdentifierOptions = Partial<InputConfig> & {
  role?: string;
  purpose?: string;
};

export default {
  Owner: 'roles/owner',
  CloudSQL: {
    Client: 'roles/cloudsql.client'
  },

  inputIdentifier: async ({
    role,
    purpose = 'use',
    ...rest
  }: InputIdentifierOptions) =>
    role ||
    (await cli.prompts.input({
      message: `IAM role${lib.prompts.pad(purpose)}`,
      validate: cli.validators.notEmpty,
      ...rest
    }))
};
