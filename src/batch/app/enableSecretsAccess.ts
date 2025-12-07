import * as app from '../../app/index.js';
import * as lib from '../../lib/index.js';
import * as iam from '../iam/index.js';

type Options = {
  appEngine?: app.AppEngine;
};

/**
 * Enable access to the Google Cloud Secrets Manager from Google App Engine
 *
 * This assigns the SecretAccessor role to the App Engine service account.
 *
 * This is now more easily accomplished use {@link batch.app.initialize()} and
 * setting the `secretsAccess` parameter to `true`. After the fact,
 * batch.{@link iam.enableServiceAccountSecretsAccess()} can also be used.
 *
 * @deprecated Use {@link app.initialize()} or
 *   {@link iam.enableServiceAccountSecretsAccess()}
 */
export async function enableSecretsAccess({ appEngine }: Options = {}) {
  appEngine = appEngine || (await app.describe());
  if (!appEngine) {
    if (
      await lib.prompts.confirm({
        message: 'App Engine is not enabled. Enable?'
      })
    ) {
      appEngine = await app.create();
      await app.deploy();
    } else {
      throw new Error(
        'Cannot App Engine access to Secret Manager without enableing App Engine'
      );
    }
  }
  await iam.enableServiceAccountSecretsAccess({
    serviceAccount: appEngine.serviceAccount
  });
}
