import * as app from '../app';
import * as iam from '../iam';
import * as lib from '../lib';
import * as services from '../services';
import * as shell from '../shell';
import Secret from './Secret';
import * as versions from './versions';
import cli from '@battis/qui-cli';
import { RequireOnlyOne } from '@battis/typescript-tricks';

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
    (await cli.prompts.input({
      message: 'Secret name',
      validate: cli.validators.notEmpty
    }));
  if (value === undefined) {
    if (
      path === undefined &&
      !(await cli.prompts.confirm({
        message: 'Is this secret value stored in a file?',
        default: true
      }))
    ) {
      value = await cli.prompts.input({ message: 'Secret value' });
    } else {
      path = await lib.prompts.input({
        arg: path,
        message: 'Path to secret value',
        validate: cli.validators.pathExists()
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
              ? `printf ${lib.prompts.escape(value)}}`
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

export { type Secret };
export { versions };
