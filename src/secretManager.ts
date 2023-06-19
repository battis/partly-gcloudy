import cli from '@battis/cli';
import * as appEngine from './appEngine';
import invoke from './invoke';
import * as project from './project';

type BaseSetOptions = {
  name: string;
};

type ValueSetOptions = BaseSetOptions & {
  value: string;
  path: never;
};

type PathSetOptions = BaseSetOptions & {
  value: never;
  path: string;
};

type SetOptions = ValueSetOptions | PathSetOptions;

type Secret = {
  createTime: string;
  etag: string;
  name: string;
  replication: { [key: string]: string };
};

let apiEnabled = false;

export async function set({ name, value, path }: Partial<SetOptions>) {
  name =
    name ||
    (await cli.io.prompts.input({
      message: 'Secret name',
      validate: cli.io.validators.notEmpty
    }));
  if (value == undefined && path == undefined) {
    if (
      await cli.io.prompts.confirm({
        message: 'Is this secret value stored in a file?',
        default: true
      })
    ) {
      path = await cli.io.prompts.input({
        message: 'Path to secret value',
        validate: cli.io.validators.pathExists,
        default: cli.appRoot()
      });
    }
  }
  if (!apiEnabled) {
    await invoke(`services enable secretmanager.googleapis.com`);
    apiEnabled = true;
  }
  let [secret] = await invoke<Secret[]>(`secrets list --filter=name:${name}`);
  if (secret) {
    await invoke(
      `secrets versions add ${secret.name} --data-file=${path !== undefined ? `"${path}"` : '-'
      }`,
      { pipe: { in: value !== undefined ? `printf "${value}"}` : undefined } }
    );
  } else {
    secret = await invoke<Secret>(
      `secrets create ${name} --data-file=${path !== undefined ? `"${path}"` : '-'
      }`,
      { pipe: { in: value !== undefined ? `printf "${value}"}` : undefined } }
    );
  }
  return secret;
}

export async function enableAppEngineAccess() {
  await invoke(
    `projects add-iam-policy-binding ${project.getId()} --member="serviceAccount:${(
      await appEngine.describe()
    ).serviceAccount
    }" --role="roles/secretmanager.secretAccessor"`
  );
}
