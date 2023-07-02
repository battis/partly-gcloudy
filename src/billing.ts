import cli from '@battis/qui-cli';
import path from 'path';
import project from './project';
import shell from './shell';

type EnableOptions = {
  accountId: string;
};

type BillingAccountDescription = {
  displayName: string;
  masterBillingAccount: string;
  name: string;
  open: boolean;
};

export default {
  enable: async function({ accountId }: Partial<EnableOptions>) {
    if (!accountId) {
      const response = shell.gcloudBeta<BillingAccountDescription[]>(
        `billing accounts list --filter=open=true`
      );
      if (response) {
        const choices = response.map((account) => ({
          name: account.displayName,
          value: path.basename(account.name)
        }));
        if (choices.length > 1) {
          accountId = await cli.prompts.select({
            message: 'Select a billing account for this project',
            choices
          });
        } else if (
          choices[0] &&
          (await cli.prompts.confirm({
            message: `Use billing account ${cli.colors.value(choices[0].name)}?`
          }))
        ) {
          accountId = choices[0].value as string;
        }
      }
    }

    if (accountId) {
      shell.gcloudBeta(
        `billing projects link ${project.id.get()} --billing - account="${accountId}"`
      );
    } else {
      // FIXME this is kinda hack-tacular
      await cli.prompts.confirm({
        message:
          'Confirm that you have created a billing account for this project'
      });
    }
  }
};
