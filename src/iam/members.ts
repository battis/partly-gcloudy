import cli from '@battis/qui-cli';
import lib from '../lib';
import { InputConfig } from '../lib/prompts/input';

type InputIdentifierOptions = Partial<InputConfig> & {
  member?: string;
  purpose?: string;
};

export default {
  inputIdentifier: async function(options?: InputIdentifierOptions) {
    const { member, purpose, ...rest } = options;
    return (
      member ||
      (await cli.prompts.input({
        message: `IAM Member${lib.prompts.pad(purpose)}`,
        validate: cli.validators.email,
        ...rest
      }))
    );
  }
};
