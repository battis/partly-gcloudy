import { Validators } from '@battis/qui-cli.validators';
import { RequireOnlyOne } from '@battis/typescript-tricks';
import { confirm, input } from '@inquirer/prompts';
import * as app from './app.js';
import * as iam from './iam.js';
import * as lib from './lib.js';
import { Secret } from './secrets/Secret.js';
import * as versions from './secrets/versions.js';
import * as services from './services.js';
import * as shell from './shell.js';

export { Secret, versions };

let apiEnabled = false;

export async function set({
  name,
  value,
  path
}: RequireOnlyOne<
  { name: string; value: string; path: string },
  'value' | 'path'
>) {
  name =
    name ||
    (await input({
      message: 'Secret name',
      validate: Validators.notEmpty
    }));
  if (value === undefined) {
    if (
      path === undefined &&
      !(await confirm({
        message: 'Is this secret value stored in a file?',
        default: true
      }))
    ) {
      value = await input({ message: 'Secret value' });
    } else {
      path = await lib.prompts.input({
        arg: path,
        message: 'Path to secret value',
        validate: Validators.pathExists()
      });
    }
  }
  if (!apiEnabled) {
    await services.enable(services.API.SecretManagerAPI);
    apiEnabled = true;
  }
  let [secret] = await shell.gcloud<Secret[]>(
    `secrets list --filter=name:${name}`
  );
  if (secret) {
    await shell.gcloud(
      `secrets versions add ${secret.name} --data-file=${
        path !== undefined ? `${path}` : '-'
      }`,
      {
        pipe: {
          in:
            value !== undefined
              ? `printf ${lib.prompts.escape(value)}`
              : undefined
        }
      }
    );
  } else {
    secret = await shell.gcloud<Secret>(
      `secrets create ${name} --data-file=${
        path !== undefined ? `${path}` : '-'
      }`,
      {
        pipe: {
          in:
            value !== undefined
              ? `printf ${lib.prompts.escape(value)}`
              : undefined
        }
      }
    );
  }

  return secret;
}

export async function enableAppEngineAccess() {
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
  await iam.addPolicyBinding({
    user: appEngine.serviceAccount,
    userType: 'serviceAccount',
    role: iam.Role.SecretManager.SecretAccessor
  });
}
