import * as projects from '#projects';
import { gcloudBeta } from '#shell';
import { Colors } from '@qui-cli/colors';
import * as accounts from '../accounts/index.js';

type Options = {
  billingAccount?: string;
  projectId?: string;

  /** @deprecated Use {@link billingAccount} */
  account?: string;
};

/**
 * Enable, disable, or change billing for a project
 *
 * @see https://docs.cloud.google.com/billing/docs/how-to/modify-project
 */
export async function link({
  billingAccount,
  account,
  projectId = projects.active.get()?.projectId
}: Options = {}) {
  billingAccount = await accounts.select({
    name: billingAccount || account,
    purpose: 'to link to the project'
  });
  if (billingAccount) {
    projectId =
      projectId ||
      (await projects.select({
        projectId,
        purpose: `to link to billing account ${Colors.value(account)}`
      }));
    await gcloudBeta(`billing projects link ${projectId}`, {
      flags: { 'billing-account': billingAccount },
      includeProjectIdFlag: false
    });
  } else {
    throw new Error(
      `Billing accounts must be created interactively at ${Colors.url(
        'https://console.cloud.google.com/billing'
      )}`,
      { cause: 'No billing accounts available to select from' }
    );
  }
}

/** @deprecated Use {@link link()} */
export const enable = link;
