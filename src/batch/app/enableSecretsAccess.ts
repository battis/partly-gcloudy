import * as app from '../../app/index.js';
import * as lib from '../../lib/index.js';
import * as iam from '../iam/index.js';

type Options = {
  appEngine?: app.AppEngine;
};

/** @deprecated Use {@link iam.enableServiceAccountSecretsAccess()} */
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
