import lib from '../../lib';
import shell from '../../shell';
import TAccount from './Account';

class accounts {
  protected constructor() {
    // ignore
  }

  public static active = new lib.Active<accounts.Account>(undefined);

  public static list = () =>
    shell.gcloud<accounts.Account[]>(
      'billing accounts list --filter=open=true'
    );

  public static selectName = async ({
    name,
    ...rest
  }: {
    name?: string;
  } & Partial<lib.prompts.select.Parameters.ValueToString<accounts.Account>>) =>
    await lib.prompts.select<accounts.Account>({
      arg: name,
      message: 'Billing account',
      choices: () =>
        this.list().map((a) => ({
          name: a.displayName,
          value: a,
          description: a.name,
          disabled: !a.open
        })),
      transform: (a: accounts.Account) => a.name,
      ...rest
    });

  public static selectidentifier = this.selectName;
}

namespace accounts {
  export type Account = TAccount;
}

export { accounts as default };
