import * as app from '#app';
import * as lib from '#lib';
import * as iam from '../iam/index.js';

/**
 * Enable access to the Google Cloud Secrets Manager from Google App Engine
 *
 * This assigns the SecretAccessor role to the App Engine service account.
 *
 * This is now more easily accomplished use {@link batch.app.initialize()} and
 * setting the 'secretsAccess`parameter to`true'. After the fact,
 * batch.{@link iam.enableServiceAccountSecretsAccess()} can also be used.
 *
 * @deprecated Use {@link app.initialize()} or
 *   {@link iam.enableServiceAccountSecretsAccess()}
 */
export async function enableSecretsAccess({
  appEngine,
  ...options
}: enableSecretsAccess.Options = {}) {
  appEngine = appEngine || (await app.describe());
  if (!appEngine) {
    if (
      await lib.prompts.confirm({
        message: 'App Engine is not enabled. Enable?',
        ...options
      })
    ) {
      appEngine = await app.create({ ...options });
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

export namespace enableSecretsAccess {
  export type Options = {
    appEngine?: app.AppEngine;
  } & Partial<lib.prompts.confirm.Options> &
    Partial<app.create.Options>;
}
