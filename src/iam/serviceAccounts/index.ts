import cli from '@battis/qui-cli';
import lib from '../../lib';
import projects from '../../projects';
import shell from '../../shell';
import TKey from './Key';
import TServiceAccount from './ServiceAccount';

class serviceAccounts {
  protected constructor() {
    // ignore
  }

  private static MAX_KEYS = 10;

  public active = new lib.Active<serviceAccounts.ServiceAccount>(
    undefined,
    'email'
  );

  public static async inputName({
    name,
    validate,
    ...rest
  }: Partial<
    Parameters<typeof lib.prompts.input<serviceAccounts.Identifier>>[0]
  > & {
    name?: string;
  } = undefined) {
    return await lib.prompts.input({
      message: 'Service account name',
      arg: name,
      validate: cli.validators.combine(validate, cli.validators.notEmpty),
      default: lib.generate.projectId(),
      ...rest
    });
  }

  public static inputIdentifier = this.inputName;

  public static async inputDisplayName({
    displayName,
    validate,
    ...rest
  }: Partial<
    Parameters<typeof lib.prompts.input<serviceAccounts.DisplayName>>[0]
  > & {
    displayName?: string;
  } = undefined) {
    return await lib.prompts.input({
      arg: displayName,
      message: 'Service account display name',
      validate: cli.validators.combine(validate, cli.validators.notEmpty),
      ...rest
    });
  }

  public static list = () =>
    shell.gcloud<serviceAccounts.ServiceAccount[]>('iam service-accounts list');

  public static async selectEmail({
    email,
    ...rest
  }: Partial<
    lib.prompts.select.Parameters.ValueToString<serviceAccounts.ServiceAccount>
  > &
    Partial<Parameters<typeof this.create>[0]> & {
      email?: string;
    } = undefined) {
    return lib.prompts.select({
      arg: email,
      message: `Service account`,
      choices: () =>
        this.list().map((s) => ({
          name: s.displayName,
          value: s,
          description: s.email
        })),
      transform: (s: serviceAccounts.ServiceAccount) => s.email,
      ...rest
    });
  }

  public static selectIdentifier = this.selectEmail;

  public static async create({
    name,
    displayName
  }: {
    name?: string;
    displayName?: string;
  } = undefined) {
    name = await this.inputName({ name });
    displayName = await this.inputDisplayName({ displayName, default: name });
    let [serviceAccount] = shell.gcloud<serviceAccounts.ServiceAccount[]>(
      `iam service-accounts list --filter=email=${name}@${projects.active.get()}.iam.gserviceaccount.com`,
      { includeProjectIdFlag: true }
    );
    if (!serviceAccount) {
      serviceAccount = shell.gcloud<serviceAccounts.ServiceAccount>(
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
  public static async keys({
    email,
    path,
    cautiouslyDeleteExpiredKeysIfNecessary,
    dangerouslyDeleteAllKeysIfNecessary
  }: {
    email?: string;
    path?: string;
    cautiouslyDeleteExpiredKeysIfNecessary?: boolean;
    dangerouslyDeleteAllKeysIfNecessary?: boolean;
  } = undefined) {
    email = await this.selectIdentifier({ email });
    path = await lib.prompts.input({
      arg: path,
      message: 'Path to stored credentials file',
      validate: cli.validators.pathExists()
    });
    let keys =
      shell.gcloud<serviceAccounts.Key[]>(
        `iam service-accounts keys list --iam-account=${email}`
      ) || [];
    if (keys.length === this.MAX_KEYS) {
      if (cautiouslyDeleteExpiredKeysIfNecessary === undefined) {
        cautiouslyDeleteExpiredKeysIfNecessary = !!(await cli.prompts.confirm({
          message: `${keys.length} keys already exist, delete expired keys?`
        }));
      }
      if (cautiouslyDeleteExpiredKeysIfNecessary) {
        const now = new Date();
        keys = keys.reduce(
          (retainedKeys: serviceAccounts.Key[], key: serviceAccounts.Key) => {
            const expiry = new Date(key.validBeforeTime);
            if (expiry < now) {
              shell.gcloud(
                `iam service-accounts keys delete ${key.name} --iam-account=${email}`
              );
            } else {
              retainedKeys.push(key);
            }
            return retainedKeys;
          },
          []
        );
      }
      if (
        keys.length === this.MAX_KEYS &&
        dangerouslyDeleteAllKeysIfNecessary === undefined
      ) {
        dangerouslyDeleteAllKeysIfNecessary = !!(await cli.prompts.confirm({
          message: `${keys.length} keys already exist, delete all keys?`
        }));
      }
      if (
        keys.length === this.MAX_KEYS &&
        dangerouslyDeleteAllKeysIfNecessary
      ) {
        keys.forEach(async (key) => {
          shell.gcloud(
            `iam service-accounts keys delete ${key.name} --iam-account=${email}`
          );
        });
        keys = [];
      }
    }
    const key = shell.gcloud<serviceAccounts.Key>(
      `iam service-accounts keys create ${path} --iam-account=${email}`
    );
    if (!key) {
      throw new Error(
        `Key creation failed (${keys.length} keys already created)`
      );
    }
    return key;
  }
}

namespace serviceAccounts {
  export type Identifier = string;
  export type DisplayName = string;
  export type ServiceAccount = TServiceAccount;
  export type Key = TKey;
}

export { serviceAccounts as default };
