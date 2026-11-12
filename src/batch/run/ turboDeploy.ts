import path from 'node:path';
import { Colors } from '@qui-cli/colors';
import { Positionals } from '@qui-cli/core';
import { Env } from '@qui-cli/env';
import * as Plugin from '@qui-cli/plugin';
import { deployService } from './deployService.js';
import * as projects from '#projects';

export type Configuration = Plugin.Configuration & {
  serviceName?: string;
  concurrency?: number;
  maxInstances?: number;
  allowUnauthenticated?: boolean;
  iap?: boolean;
  memory?: string;
  serviceAccount?: string;
  debug?: boolean;
};

Positionals.require({
  serviceName: {
    description: 'Name of service to deploy'
  }
});
Positionals.allowOnlyNamedArgs();

const config: Configuration = {
  allowUnauthenticated: false,
  debug: false
};

export const name = 'deploy';

export function configure(proposal: Partial<Configuration> = {}) {
  for (const key in proposal) {
    if (proposal[key] !== undefined) {
      config[key] = proposal[key];
    }
  }
}

export function options() {
  return {
    man: [{ level: 1, text: 'Deploy Options' }],
    num: {
      concurrency: {
        description: 'Service concurrency limit',
        short: 'c',
        env: 'CONCURRENCY',
        default: config.concurrency
      },
      maxInstances: {
        description: 'Max number of service instances',
        short: 'i',
        env: 'MAX_INSTANCES',
        default: config.maxInstances
      }
    },
    flag: {
      allowUnauthenticated: {
        description: 'Allow unauthenticated web access to the service',
        short: 'u',
        env: 'ALLOW_UNAUTHENTICATED',
        default: config.allowUnauthenticated
      },
      iap: {
        description: 'Enable IAP',
        env: 'IAP',
        default: config.iap
      },
      debug: {
        description: 'Include debugging output in log',
        env: 'DEBUG'
      }
    },
    opt: {
      serviceAccount: {
        description: 'Service Account to run the service',
        short: 's',
        env: 'SERVICE_ACCOUNT',
        default: config.serviceAccount
      },
      memory: {
        description:
          'Amount of memory allocated to service (512MiB if not specified)',
        short: 'm',
        hint: Colors.quotedValue(`"1GiB"`),
        env: 'MEMORY',
        default: config.memory
      }
    }
  };
}

export async function init(args: Plugin.ExpectedArguments<typeof options>) {
  const serviceName = Positionals.get('serviceName');
  if (serviceName) {
    await Env.configure({
      path: path.join(process.cwd(), `.env.${serviceName}`)
    });
    await Env.init(args);
  }
  configure({ serviceName, ...(args.values ? args.values : {}) });
}

export async function run() {
  const {
    serviceName,
    concurrency,
    maxInstances,
    allowUnauthenticated,
    iap,
    serviceAccount,
    memory,
    debug
  } = config;

  if (!serviceName) {
    throw new Error(`${Colors.positionalArg('serviceName')} is required`);
  }

  const vars = JSON.parse((await Env.get({ key: 'VARS' })) || '[]') as string[];
  const secrets = JSON.parse(
    (await Env.get({ key: 'SECRETS' })) || '[]'
  ) as string[];

  await deployService({
    serviceName,
    serviceAccount,
    args: {
      'base-image': 'nodejs24',
      'automatic-updates': true,
      source: `./out/${serviceName}`,
      'max-instances': maxInstances,
      concurrency,
      memory,
      ...(secrets.length
        ? {
            'update-secrets': secrets
              .map((secret) => `${secret}=${secret}:latest`)
              .join(',')
          }
        : {}),
      'set-env-vars': [
        ['GOOGLE_CLOUD_PROJECT', projects.active.getIdentifier()],
        ...(debug ? [['DEBUG', 'true']] : []),
        ...(await Promise.all(
          vars.map(async (key) => [key, await Env.get({ key })])
        ))
      ]
        .map(([name, value]) => `${name}=${value}`)
        .join(','),
      ...(allowUnauthenticated ? { 'allow-unauthenticated': true } : {}),
      ...(iap ? { iap: true } : {})
    },
    retainRevisions: 2
  });
}
