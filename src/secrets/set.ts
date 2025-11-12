import { RequireOnlyOne } from '@battis/typescript-tricks';
import { confirm, input } from '@inquirer/prompts';
import { Validators } from '@qui-cli/validators';
import * as lib from '../lib/index.js';
import * as services from '../services/index.js';
import * as shell from '../shell/index.js';
import { Secret } from './Secret.js';

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
