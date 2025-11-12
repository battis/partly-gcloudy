import { confirm } from '@inquirer/prompts';
import { Validators } from '@qui-cli/validators';
import type { Email } from '../../lib/index.js';
import * as lib from '../../lib/index.js';
import * as shell from '../../shell/index.js';
import { Key } from './Key.js';
import { select } from './select.js';

const MAX_KEYS = 10;
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
  email = await select({ email });
  path = await lib.prompts.input({
    arg: path,
    message: 'Path to stored credentials file',
    validate: Validators.pathExists()
  });
  let keys =
    (await shell.gcloud<Key[]>(
      `iam service-accounts keys list --iam-account=${email}`
    )) || [];
  if (keys.length === MAX_KEYS) {
    if (cautiouslyDeleteExpiredKeysIfNecessary === undefined) {
      cautiouslyDeleteExpiredKeysIfNecessary = !!(await confirm({
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
      dangerouslyDeleteAllKeysIfNecessary = !!(await confirm({
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
