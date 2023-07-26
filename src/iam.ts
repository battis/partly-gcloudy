import cli from '@battis/qui-cli';
import fs from 'fs';
import project from './project';
import shell from './shell';

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

/** @see https://cloud.google.com/iam/docs/reference/rest/v1/Policy#Binding.FIELDS.members */
type UserType = 'user' | 'serviceAccount' | 'group';

type AddPolicyBindingOptions = {
  role: string;
  user: string;
  userType: UserType;
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

export default {
  Roles: {
    Owner: 'roles/owner',
    CloudSQL: {
      Client: 'roles/cloudsql.client'
    }
  },

  createServiceAccount: async function({
    name,
    displayName
  }: Partial<CreateServiceAccountOptions>) {
    name =
      name ||
      (await cli.prompts.input({
        message: 'Service account name',
        validate: cli.validators.notEmpty,
        default: project.id.generate()
      }));
    displayName =
      displayName ||
      (await cli.prompts.input({
        message: 'Service account display name',
        validate: cli.validators.notEmpty,
        default: name
      }));
    let [serviceAccount] = shell.gcloud<ServiceAccount[]>(
      `iam service-accounts list --filter=email=${name}@${project.id.get()}.iam.gserviceaccount.com`,
      { includeProjectIdFlag: true }
    );
    if (!serviceAccount) {
      serviceAccount = shell.gcloud<ServiceAccount>(
        `iam service-accounts create ${name} --display-name="${displayName || name
        }"`
      );
    }
    return serviceAccount;
  },

  /*
   * FIXME use Workload Identity Federation
   *  Service account keys could pose a security risk if compromised. We
   *  recommend you avoid downloading service account keys and instead use the
   *  Workload Identity Federation . You can learn more about the best way to
   *  authenticate service accounts on Google Cloud here.
   *  https://cloud.google.com/iam/docs/workload-identity-federation
   *  https://cloud.google.com/blog/products/identity-security/how-to-authenticate-service-accounts-to-help-keep-applications-secure
   */
  getServiceAccountCredentials: async function({
    email,
    path,
    cautiouslyDeleteExpiredKeysIfNecessary,
    dangerouslyDeleteAllKeysIfNecessary
  }: Partial<GetServiceAccountCredentials>) {
    email =
      email ||
      (await cli.prompts.input({
        message: 'Service account email address',
        validate: cli.validators.email
      }));
    path =
      path ||
      (await cli.prompts.input({
        message: 'Path to stored credentials file',
        validate: (value: string) =>
          fs.existsSync(value) || `${value} does not exist`,
        default: cli.appRoot()
      }));
    let keys =
      shell.gcloud<Key[]>(
        `iam service-accounts keys list --iam-account=${email}`
      ) || [];
    if (keys.length === MAX_KEYS) {
      if (cautiouslyDeleteExpiredKeysIfNecessary === undefined) {
        cautiouslyDeleteExpiredKeysIfNecessary = !!(await cli.prompts.confirm({
          message: `${keys.length} keys already exist, delete expired keys?`
        }));
      }
      if (cautiouslyDeleteExpiredKeysIfNecessary) {
        const now = new Date();
        keys = keys.reduce((_keys: Key[], key: Key) => {
          const expiry = new Date(key.validBeforeTime);
          if (expiry < now) {
            shell.gcloud(
              `iam service-accounts keys delete ${key.name} --iam-account=${email}`
            );
          } else {
            _keys.push(key);
          }
          return _keys;
        }, []);
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
          shell.gcloud(
            `iam service-accounts keys delete ${key.name} --iam-account=${email}`
          );
        });
        keys = [];
      }
    }
    const key = shell.gcloud<Key>(
      `iam service-accounts keys create ${path} --iam-account=${email}`
    );
    if (!key) {
      throw new Error(
        `Key creation failed (${keys.length} keys already created)`
      );
    }
    return key;
  },

  addPolicyBinding: async function({
    user,
    userType = 'user',
    role
  }: Partial<AddPolicyBindingOptions>) {
    user =
      user ||
      (await cli.prompts.input({
        message: 'User for whom to add policy binding',
        validate: cli.validators.email
      }));
    role =
      role ||
      (await cli.prompts.input({
        message: `Role to bind to ${user}`,
        validate: cli.validators.notEmpty
      }));

    return shell.gcloud<IAMPolicy>(
      `projects add-iam-policy-binding ${project.id.get()} --member="${userType}:${user}" --role="${role}"`
    );
  }
};
