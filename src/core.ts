import * as projects from '#projects';
import { Colors } from '@qui-cli/colors';
import { Env } from '@qui-cli/env';
import * as Plugin from '@qui-cli/plugin';
import { ExpectedArguments } from '@qui-cli/plugin';
import { Shell } from '@qui-cli/shell';

export type Configuration = Plugin.Configuration & {
  verbose?: boolean;
  project?: string;
  projectEnvVar?: string;
};

export const name = 'gcloud';

const config: Configuration = {
  verbose: false,
  projectjectEnvVar: 'PROJECT'
};
let _initialized = false;

export function configure(proposal: Configuration = {}) {
  for (const key in proposal) {
    if (proposal[key] !== undefined) {
      config[key] = proposal[key];
    }
  }
  Shell.configure({
    showCommands: !!config.verbose,
    silent: !config.verbose
  });
}

export function options() {
  return {
    man: [{ level: 1, text: 'gcloud Options' }],
    flag: {
      verbose: {
        short: 'v',
        description: 'Show verbose output (commands and results)',
        default: config.verbose
      }
    },
    opt: {
      project: {
        short: 'p',
        env: config.projectEnvVar,
        description: 'Google Cloud project ID'
      },
      projectEnvVar: {
        description: 'Environment variable that stores Google Cloud project ID',
        default: config.projectEnvVar
      }
    }
  };
}

export async function init({ values }: ExpectedArguments<typeof options>) {
  configure(values);
  // @qui-cli/env may have used an _old_ projectEnvVar value, need to re-check
  if (config.projectEnvVar && !config.project) {
    configure({ project: await Env.get({ key: config.projectEnvVar }) });
  }
  if (config.project) {
    const project = await projects.describe({ projectId: config.project });
    if (project) {
      projects.active.activate(project);
    }
  }
  _initialized = true;
}

export function initialized() {
  return _initialized;
}

/** @deprecated Use {@link initialized()} */
export const ready = initialized;

export async function writeEnv({
  projectId,
  ...values
}: Record<string, unknown> & { projectId: string | undefined }) {
  if (projectId) {
    if (config.projectEnvVar) {
      await Env.set({ key: config.projectEnvVar, value: projectId });
    } else {
      throw new Error(`${Colors.optionArg('--projectEnvVar')} not defined`);
    }
  }
  for (const key in values) {
    if (values[key] !== undefined && values[key] !== null) {
      await Env.set({ key, value: values[key].toString() });
    }
  }
}
