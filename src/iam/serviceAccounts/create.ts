import { Validators } from '@qui-cli/validators';
import * as lib from '../../lib/index.js';
import * as projects from '../../projects/index.js';
import * as shell from '../../shell/index.js';
import { ServiceAccount } from './ServiceAccount.js';

type Identifier = string;
type DisplayName = string;

export async function inputName({
  name,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<Identifier>>[0]> & {
  name?: string;
} = {}) {
  return await lib.prompts.input({
    message: 'Service account name',
    arg: name,
    validate: Validators.combine(validate || (() => true), Validators.notEmpty),
    default: lib.generate.projectId(),
    ...rest
  });
}

export const inputIdentifier = inputName;

export async function inputDisplayName({
  displayName,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<DisplayName>>[0]> & {
  displayName?: string;
} = {}) {
  return await lib.prompts.input({
    arg: displayName,
    message: 'Service account display name',
    validate: Validators.combine(validate || (() => true), Validators.notEmpty),
    ...rest
  });
}

export async function create({
  name,
  displayName
}: {
  name?: string;
  displayName?: string;
} = {}) {
  name = await inputName({ name });
  displayName = await inputDisplayName({ displayName, default: name });
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
