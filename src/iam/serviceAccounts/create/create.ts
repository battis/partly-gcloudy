import * as projects from '#projects';
import { gcloud } from '#shell';
import { ServiceAccount } from '../ServiceAccount.js';
import { inputDisplayName } from './DisplayName.js';
import { inputName } from './Name.js';

type Options = {
  name?: string;
  displayName?: string;
  purpose?: string;
  defaultName?: string;
  defaultDisplayName?: string;
};

export async function create({
  name,
  displayName,
  defaultDisplayName,
  ...options
}: Options = {}) {
  name = await inputName({ name, ...options });
  displayName = await inputDisplayName({
    displayName,
    default: defaultDisplayName || name,
    ...options
  });
  let [serviceAccount] = await gcloud<ServiceAccount[]>(
    'iam service-accounts list',
    {
      flags: {
        filter: `email=${name}@${projects.active.get()?.projectId}.iam.gserviceaccount.com`
      },
      includeProjectIdFlag: true
    }
  );
  if (!serviceAccount) {
    serviceAccount = await gcloud<ServiceAccount>(
      `iam service-accounts create ${name}`,
      { flags: { 'display-name': displayName || name } }
    );
  }
  return serviceAccount;
}
