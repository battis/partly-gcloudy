import cli from '@battis/qui-cli';
import app from './app';
import iam from './iam';
import lib from './lib';
import services from './services';
import shell from './shell';

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

export default {
  set: async function(options?: Partial<SetOptions>) {
    let { name, value, path } = options;
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
        path = await lib.prompts.inputPath({
          arg: path,
          message: 'Path to secret value'
        });
      }
    }
    if (!apiEnabled) {
      await services.enable({ service: services.API.SecretManagerAPI });
      apiEnabled = true;
    }
    let [secret] = shell.gcloud<Secret[]>(`secrets list --filter=name:${name}`);
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
      secret = shell.gcloud<Secret>(
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
  },

  enableAppEngineAccess: async function() {
    await iam.addPolicyBinding({
      user: (await app.describe()).serviceAccount,
      userType: 'serviceAccount',
      role: 'roles/secretmanager.secretAccessor'
    });
  }
};
