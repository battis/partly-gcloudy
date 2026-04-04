import * as projects from '#projects';
import { gcloudBeta } from '#shell';
import { Colors } from '@qui-cli/colors';
import * as accounts from '../accounts/index.js';

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
    projectId = await projects.select({
      projectId,
      purpose: `to link to billing account ${Colors.value(account)}`
    });
    await gcloudBeta(
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
