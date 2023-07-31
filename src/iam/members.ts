import cli from '@battis/qui-cli';
import lib, { Email } from '../lib';
import { InputOptions } from '../lib/prompts';

type InputIdentifierOptions = Partial<InputOptions<Email>> & {
  member?: string;
};

export default {
  inputIdentifier: async function(options?: InputIdentifierOptions) {
    const { member, ...rest } = options;
    return await lib.prompts.input({
      arg: member,
      message: `IAM Member`,
      validate: cli.validators.email,
      ...rest
    });
  }
};
