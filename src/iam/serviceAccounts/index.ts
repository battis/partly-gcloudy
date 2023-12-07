import cli from '@battis/qui-cli';
import * as lib from '../../lib';
import type { Email } from '../../lib';
import * as projects from '../../projects';
import * as shell from '../../shell';
import Key from './Key';
import ServiceAccount from './ServiceAccount';

const MAX_KEYS = 10;

export const active = new lib.Active<ServiceAccount>(undefined, 'email');

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
    validate: cli.validators.combine(validate, cli.validators.notEmpty),
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
    validate: cli.validators.combine(validate, cli.validators.notEmpty),
    ...rest
  });
}

export async function list() {
  return await shell.gcloud<ServiceAccount[]>('iam service-accounts list');
}

export async function selectEmail({
  email,
  ...rest
}: Partial<lib.prompts.select.Parameters<ServiceAccount>> &
  Partial<Parameters<typeof create>[0]> & {
    email?: Email;
  } = {}) {
  return lib.prompts.select({
    arg: email,
    message: `Service account`,
    choices: async () =>
      (await list()).map((s) => ({
        name: s.displayName,
        value: s,
        description: s.email
      })),
    transform: (s: ServiceAccount) => s.email,
    ...rest
  });
}

export const selectIdentifier = selectEmail;

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
    `iam service-accounts list --filter=email=${name}@${projects.active.get()}.iam.gserviceaccount.com`,
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

/*
 * FIXME use Workload Identity Federation
 *  Service account keys could pose a security risk if compromised. We
 *  recommend you avoid downloading service account keys and instead use the
 *  Workload Identity Federation . You can learn more about the best way to
 *  authenticate service accounts on Google Cloud here.
 *  https://cloud.google.com/iam/docs/workload-identity-federation
 *  https://cloud.google.com/blog/products/identity-security/how-to-authenticate-service-accounts-to-help-keep-applications-secure
 */
export async function keys({
  email,
  path,
  cautiouslyDeleteExpiredKeysIfNecessary,
  dangerouslyDeleteAllKeysIfNecessary
}: {
  email?: Email;
  path?: string;
  cautiouslyDeleteExpiredKeysIfNecessary?: boolean;
  dangerouslyDeleteAllKeysIfNecessary?: boolean;
} = {}) {
  email = await selectIdentifier({ email });
  path = await lib.prompts.input({
    arg: path,
    message: 'Path to stored credentials file',
    validate: cli.validators.pathExists()
  });
  let keys =
    (await shell.gcloud<Key[]>(
      `iam service-accounts keys list --iam-account=${email}`
    )) || [];
  if (keys.length === MAX_KEYS) {
    if (cautiouslyDeleteExpiredKeysIfNecessary === undefined) {
      cautiouslyDeleteExpiredKeysIfNecessary = !!(await cli.prompts.confirm({
        message: `${keys.length} keys already exist, delete expired keys?`
      }));
    }
    if (cautiouslyDeleteExpiredKeysIfNecessary) {
      const now = new Date();
      const retainedKeys: Key[] = [];
      keys.forEach(async (key) => {
        const expiry = new Date(key.validBeforeTime);
        if (expiry < now) {
          await shell.gcloud(
            `iam service-accounts keys delete ${key.name} --iam-account=${email}`
          );
        } else {
          retainedKeys.push(key);
        }
      });
      keys = retainedKeys;
    }
    if (
      keys.length === MAX_KEYS &&
      dangerouslyDeleteAllKeysIfNecessary === undefined
    ) {
      dangerouslyDeleteAllKeysIfNecessary = !!(await cli.prompts.confirm({
        message: `${keys.length} keys already exist, delete all keys?`
      }));
    }
    if (keys.length === MAX_KEYS && dangerouslyDeleteAllKeysIfNecessary) {
      keys.forEach(async (key) => {
        await shell.gcloud(
          `iam service-accounts keys delete ${key.name} --iam-account=${email}`
        );
      });
      keys = [];
    }
  }
  const key = await shell.gcloud<Key>(
    `iam service-accounts keys create ${path} --iam-account=${email}`
  );
  if (!key) {
    throw new Error(
      `Key creation failed (${keys.length} keys already created)`
    );
  }
  return key;
}

export type Identifier = string;
export type DisplayName = string;

export { type ServiceAccount, type Key };
