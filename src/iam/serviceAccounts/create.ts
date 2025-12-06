import { Validators } from '@qui-cli/validators';
import * as lib from '../../lib/index.js';
import * as projects from '../../projects/index.js';
import * as shell from '../../shell/index.js';
import { ServiceAccount } from './ServiceAccount.js';

type Identifier = string;
type DisplayName = string;

export async function inputName({
  name,
  defaultName = lib.generate.projectId(),
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<Identifier>>[0]> & {
  name?: string;
  defaultName?: string;
} = {}) {
  return await lib.prompts.input({
    message: 'Service account name',
    default: defaultName,
    arg: name,
    validate: Validators.combine(validate || (() => true), Validators.notEmpty),
    ...rest
  });
}

export const inputIdentifier = inputName;

export async function inputDisplayName({
  displayName,
  defaultDisplayName,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<DisplayName>>[0]> & {
  displayName?: string;
  defaultDisplayName?: string;
} = {}) {
  return await lib.prompts.input({
    arg: displayName,
    default: defaultDisplayName,
    message: 'Service account display name',
    validate: Validators.combine(validate || (() => true), Validators.notEmpty),
    ...rest
  });
}

export async function create({
  name,
  displayName,
  defaultName,
  defaultDisplayName
}: {
  name?: string;
  displayName?: string;
  defaultName?: string;
  defaultDisplayName?: string;
} = {}) {
  name = await inputName({ name, defaultName });
  displayName = await inputDisplayName({
    displayName,
    default: defaultDisplayName || name
  });
  let [serviceAccount] = await shell.gcloud<ServiceAccount[]>(
    `iam service-accounts list --filter=email=${name}@${projects.active.get()?.projectId}.iam.gserviceaccount.com`,
    { includeProjectIdFlag: true }
  );
  if (!serviceAccount) {
    serviceAccount = await shell.gcloud<ServiceAccount>(
      `iam service-accounts create ${name} --display-name=${lib.prompts.escape(
        displayName || name
      )}`
    );
  }
  return serviceAccount;
}
