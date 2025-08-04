import { Colors } from '@qui-cli/colors';
import * as rootProjects from '../projects/index.js';
import * as shell from '../shell/index.js';
import * as accounts from './accounts/index.js';

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
    projectId =
      projectId ||
      (await rootProjects.selectIdentifier({
        projectId,
        purpose: `to link to billing account ${Colors.value(account)}`
      }));
    await shell.gcloudBeta(
      `billing projects link ${projectId} --billing-account=${account}`,
      { includeProjectIdFlag: false }
    );
  } else {
    throw new Error(
      `Billing accounts must be created interactively at ${Colors.url(
        'https://console.cloud.google.com/billing'
      )}`
    );
  }
}
