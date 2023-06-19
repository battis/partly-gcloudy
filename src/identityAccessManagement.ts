import cli from '@battis/cli';
import fs from 'node:fs';
import invoke from './invoke';
import * as project from './project';

const MAX_KEYS = 10;

type ServiceAccount = {
  disabled: boolean;
  displayName: string;
  email: string;
  etag: string;
  name: string;
  oauth2ClientId: string;
  projectId: string;
  uniqueId: string;
};

type CreateServiceAccountOptions = {
  name: string;
  displayName: string;
};

export async function createServiceAccount({
  name,
  displayName
}: Partial<CreateServiceAccountOptions>) {
  name =
    name ||
    (await cli.io.prompts.input({
      message: 'Service account name',
      validate: cli.io.validators.notEmpty,
      default: project.generateId()
    }));
  displayName =
    displayName ||
    (await cli.io.prompts.input({
      message: 'Service account display name',
      validate: cli.io.validators.notEmpty,
      default: name
    }));
  let [serviceAccount] = await invoke<ServiceAccount[]>(
    `iam service-accounts list --filter=email=${name}@${project.getId()}.iam.gserviceaccount.com`
  );
  if (!serviceAccount) {
    serviceAccount = await invoke<ServiceAccount>(
      `iam service-accounts create ${name} --display-name="${displayName || name
      }"`
    );
  }
  return serviceAccount;
}

type GetServiceAccountCredentials = {
  email: string;
  path: string;
  cautiouslyDeleteExpiredKeysIfNecessary?: boolean;
  dangerouslyDeleteAllKeysIfNecessary?: boolean;
};

type Key = {
  keyAlgorithm: string;
  keyOrigin: string;
  keyType: string;
  name: string;
  validAfterTime: string;
  validBeforeTime: string;
};

export async function getServiceAccountCredentials({
  email,
  path,
  cautiouslyDeleteExpiredKeysIfNecessary,
  dangerouslyDeleteAllKeysIfNecessary
}: Partial<GetServiceAccountCredentials>) {
  email =
    email ||
    (await cli.io.prompts.input({
      message: 'Service account email address',
      validate: cli.io.validators.email
    }));
  path =
    path ||
    (await cli.io.prompts.input({
      message: 'Path to store credentials file',
      validate: (value) => fs.existsSync(value) || `${value} does not exist`,
      default: cli.appRoot()
    }));
  let keys =
    (await invoke<Key[]>(
      `iam service-accounts keys list --iam-account=${email}`
    )) || [];
  if (keys.length === MAX_KEYS) {
    if (cautiouslyDeleteExpiredKeysIfNecessary === undefined) {
      cautiouslyDeleteExpiredKeysIfNecessary = !!(await cli.io.prompts.confirm({
        message: `${keys.length} keys already exist, delete expired keys?`
      }));
    }
    if (cautiouslyDeleteExpiredKeysIfNecessary) {
      const now = new Date();
      for (let i = 0; i < keys.length; i++) {
        const expiry = new Date(keys[i].validBeforeTime);
        if (expiry < now) {
          await invoke(
            `iam service-accounts keys delete ${keys[i].name} --iam-account=${email}`
          );
          keys = keys.splice(i, 1);
          i--;
        }
      }
    }
    if (
      keys.length === MAX_KEYS &&
      dangerouslyDeleteAllKeysIfNecessary === undefined
    ) {
      dangerouslyDeleteAllKeysIfNecessary = !!(await cli.io.prompts.confirm({
        message: `${keys.length} keys already exist, delete all keys?`
      }));
    }
    if (keys.length === MAX_KEYS && dangerouslyDeleteAllKeysIfNecessary) {
      keys.forEach(async (key) => {
        await invoke(
          `iam service-accounts keys delete ${key.name} --iam-account=${email}`
        );
      });
      keys = [];
    }
  }
  const key = await invoke<Key>(
    `iam service-accounts keys create ${path} --iam-account=${email}`
  );
  if (!key) {
    throw new Error(
      `Key creation failed (${keys.length} keys already created)`
    );
  }
  return key;
}

type AddPolicyBindingOptions = {
  user: string;
  role: string;
};

type IAMPolicyBinding = {
  members: string[];
  role: string;
};

type IAMPolicy = {
  bindings: IAMPolicyBinding[];
  etag: string;
  version: number;
};

export async function addPolicyBinding({
  user,
  role
}: Partial<AddPolicyBindingOptions>) {
  user =
    user ||
    (await cli.io.prompts.input({
      message: 'User for whom to add policy binding',
      validate: cli.io.validators.email
    }));
  role =
    role ||
    (await cli.io.prompts.input({
      message: `Role to bind to ${user}`,
      validate: cli.io.validators.notEmpty
    }));
  return await invoke<IAMPolicy>(
    `projects add-iam-policy-binding ${project.getId()} --member="user:${user}" --role="${role}"`
  );
}
