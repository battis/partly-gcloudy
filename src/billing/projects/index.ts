import cli from '@battis/qui-cli';
import * as rootProjects from '../../projects';
import * as shell from '../../shell';
import * as accounts from '../accounts';

export async function enable({
  account,
  projectId
}: { account?: string; projectId?: string } = {}) {
  // TODO create a new billing account interactively
  account = await accounts.selectidentifier({
    name: account,
    purpose: 'to link to the project'
  });
  if (account) {
    projectId = await rootProjects.selectIdentifier({
      projectId,
      purpose: `to link to billing account ${cli.colors.value(account)}`
    });
    await shell.gcloudBeta(
      `billing projects link ${projectId} --billing-account=${account}`,
      { includeProjectIdFlag: false }
    );
  } else {
    throw new Error(
      `Billing accounts must be create interactively at ${cli.colors.url(
        'https://console.cloud.google.com/billing'
      )}`
    );
  }
}
