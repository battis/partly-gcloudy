import cli from '@battis/qui-cli';
import lib from '../lib';
import { InputConfig } from '../lib/prompts/input';
import { SelectOptions } from '../lib/prompts/select';
import projects from '../projects';
import shell from '../shell';

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

type InputIdentifierOptions = Partial<InputConfig> & { name?: string };

async function inputIdentifier(options?: InputIdentifierOptions) {
  const { name, ...rest } = options;
  return (
    name ||
    (await cli.prompts.input({
      message: 'Service account name',
      validate: cli.validators.notEmpty,
      default: lib.generate.projectId(),
      ...rest
    }))
  );
}

type InputDisplayNameOptions = Partial<InputConfig> & { displayName?: string };

async function inputDisplayName(options?: InputDisplayNameOptions) {
  const { displayName, ...rest } = options;
  return (
    displayName ||
    (await cli.prompts.input({
      message: 'Service account display name',
      validate: cli.validators.notEmpty,
      ...rest
    }))
  );
}

const list = async () =>
  shell.gcloud<ServiceAccount[]>('iam service-accounts list');

type SelectIdentifierOptions = Partial<SelectOptions> & {
  email?: string;
  purpose?: string;
};

async function selectIdentifier(options?: SelectIdentifierOptions) {
  const { email, purpose, ...rest } = options;
  return lib.prompts.select({
    arg: email,
    message: `Service account${lib.prompts.pad(purpose)}`,
    choices: list,
    valueIn: 'email'
  });
}

export default {
  inputIdentifier,
  inputDisplayName,
  selectIdentifier,

  create: async function({
    name,
    displayName
  }: Partial<CreateServiceAccountOptions>) {
    name = await inputIdentifier({ name });
    displayName = await inputDisplayName({ displayName, default: name });
    let [serviceAccount] = shell.gcloud<ServiceAccount[]>(
      `iam service-accounts list --filter=email=${name}@${projects.active.get()}.iam.gserviceaccount.com`,
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
  keys: async function({
    email,
    path,
    cautiouslyDeleteExpiredKeysIfNecessary,
    dangerouslyDeleteAllKeysIfNecessary
  }: Partial<GetServiceAccountCredentials>) {
    email = await selectIdentifier({ email });
    path = await lib.prompts.input.path({
      path,
      purpose: 'stored credentials file'
    });
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
  }
};
