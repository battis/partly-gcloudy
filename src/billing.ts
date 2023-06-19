import cli from '@battis/cli';
import path from 'path';
import * as beta from './beta';
import * as project from './project';

type EnableOptions = {
  accountId: string;
};

type BillingAccountDescription = {
  displayName: string;
  masterBillingAccount: string;
  name: string;
  open: boolean;
};

export default async function enable({ accountId }: Partial<EnableOptions>) {
  if (!accountId) {
    const response = await beta.invoke<BillingAccountDescription[]>(
      `billing accounts list --filter=open=true`
    );
    if (response) {
      const choices = response.map((account) => ({
        name: account.displayName,
        value: path.basename(account.name)
      }));
      if (choices.length > 1) {
        accountId = await cli.io.prompts.select({
          message: 'Select a billing account for this project',
          choices
        });
      } else if (
        choices.length === 1 &&
        (await cli.io.prompts.confirm({
          message: `Use billing account ${cli.io.value(choices[0].name)}?`
        }))
      ) {
        accountId = choices[0].value as string;
      }
    }
  }

  if (accountId) {
    await beta.invoke(
      `billing projects link ${project.getId()} --billing-account="${accountId}"`
    );
  } else {
    // FIXME this is kinda hack-tacular
    await cli.io.prompts.confirm({
      message:
        'Confirm that you have created a billing account for this project'
    });
  }
}
