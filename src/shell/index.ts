import cli from '@battis/qui-cli';
import { Descriptor } from '../lib/descriptor';
import activeProject from '../projects/active';
import flags, { Flags } from './flags';

type InvokeOptions = {
  flags: Flags;
  overrideBaseFlags: boolean;
  includeProjectIdFlag: boolean;
  pipe: {
    in?: string;
    out?: string;
  };
};

function gcloud<T extends Descriptor>(
  command: string,
  options?: Partial<InvokeOptions>
) {
  const opt: InvokeOptions = {
    flags: { ...(options?.flags || {}) },
    overrideBaseFlags: options?.overrideBaseFlags || false,
    includeProjectIdFlag:
      options?.includeProjectIdFlag === false
        ? false
        : options?.includeProjectIdFlag === true
          ? true
          : !new RegExp(activeProject.get()).test(command),
    pipe: {
      in: options?.pipe?.in || undefined,
      out: options?.pipe?.out || undefined
    }
  };
  if (!opt.overrideBaseFlags) {
    opt.flags = { ...opt.flags, ...flags.getBase() };
  }
  if (opt.includeProjectIdFlag) {
    opt.flags.project = activeProject.get();
  }
  const result = cli.shell.exec(
    `${opt.pipe.in ? `${opt.pipe.in} |` : ''
    }gcloud ${command} ${flags.stringify(opt.flags)}${opt.pipe.out ? `| ${opt.pipe.out}` : ''
    }`
  ).stdout;
  try {
    return JSON.parse(result) as T;
  } catch (e) {
    return undefined as T;
  }
}

export default {
  gcloud,
  gcloudBeta: <T>(command: string, options?: Partial<InvokeOptions>) =>
    gcloud<T>(`beta ${command}`, options),

  flags
};
