import * as app from '../app/index.js';
import * as iam from '../iam/index.js';
import * as lib from '../lib/index.js';
import * as projects from '../projects/index.js';

export async function enableAppEngineSecretsAccess() {
  let appEngine = await app.describe();
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
  await projects.addIamPolicyBinding({
    user: appEngine.serviceAccount,
    userType: 'serviceAccount',
    role: iam.Role.SecretManager.SecretAccessor
  });
}
