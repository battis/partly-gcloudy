import cli from '@battis/qui-cli';
import { RequireOnlyOne } from '@battis/typescript-tricks';
import app from '../app';
import iam from '../iam';
import lib from '../lib';
import services from '../services';
import shell from '../shell';
import TSecret from './Secret';

class secrets {
  private static apiEnabled = false;

  public static async set({
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
    if (!this.apiEnabled) {
      await services.enable({ service: services.API.SecretManagerAPI });
      this.apiEnabled = true;
    }
    let [secret] = shell.gcloud<secrets.Secret[]>(
      `secrets list --filter=name:${name}`
    );
    if (secret) {
      shell.gcloud(
        `secrets versions add ${secret.name} --data-file=${path !== undefined ? `${path}` : '-'
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
      secret = shell.gcloud<secrets.Secret>(
        `secrets create ${name} --data-file=${path !== undefined ? `${path}` : '-'
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

  public static async enableAppEngineAccess() {
    await iam.addPolicyBinding({
      user: (await app.describe()).serviceAccount,
      userType: 'serviceAccount',
      role: iam.Role.SecretManager.SecretAccessor
    });
  }
}

namespace secrets {
  export type Secret = TSecret;
}

export { secrets as default };
