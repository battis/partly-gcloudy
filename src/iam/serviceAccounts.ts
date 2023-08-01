import cli from '@battis/qui-cli';
import lib from '../lib';
import { InputOptions, SelectOptions } from '../lib/prompts';
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

type ServiceAccountIdentifier = string;

type InputIdentifierOptions = Partial<
  InputOptions<ServiceAccountIdentifier>
> & {
  name?: string;
};

async function inputIdentifier(options?: InputIdentifierOptions) {
  const { name, ...rest } = options;
  return await lib.prompts.input({
    message: 'Service account name',
    arg: name,
    validate: cli.validators.notEmpty,
    default: lib.generate.projectId(),
    ...rest
  });
}

type ServiceAccountDisplayName = string;

type InputDisplayNameOptions = Partial<
  InputOptions<ServiceAccountDisplayName>
> & { displayName?: string };

async function inputDisplayName(options?: InputDisplayNameOptions) {
  const { displayName, ...rest } = options;
  return await lib.prompts.input({
    arg: displayName,
    message: 'Service account display name',
    validate: cli.validators.notEmpty,
    ...rest
  });
}

const list = async () =>
  shell.gcloud<ServiceAccount[]>('iam service-accounts list');

type SelectIdentifierOptions = Partial<SelectOptions> & {
  email?: string;
};

async function selectIdentifier(options?: SelectIdentifierOptions) {
  const { email, ...rest } = options;
  return lib.prompts.select({
    arg: email,
    message: `Service account`,
    choices: list,
    valueIn: 'email',
    ...rest
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
        `iam service-accounts create ${name} --display-name=${lib.prompts.escape(
          displayName || name
        )}`
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
    path = await lib.prompts.input({
      arg: path,
      message: 'Path to stored credentials file',
      validate: cli.validators.pathExists()
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
        keys = keys.reduce((retainedKeys: Key[], key: Key) => {
          const expiry = new Date(key.validBeforeTime);
          if (expiry < now) {
            shell.gcloud(
              `iam service-accounts keys delete ${key.name} --iam-account=${email}`
            );
          } else {
            retainedKeys.push(key);
          }
          return retainedKeys;
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
