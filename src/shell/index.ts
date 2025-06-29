import { Shell } from '@battis/qui-cli.shell';
import * as lib from '../lib/index.js';
import * as projects from '../projects/index.js';
import * as flags from './flags.js';

export type Flags = flags.Flags;

export { flags };

type Result = {
  stdout?: string;
  stderr?: string;
};

export type InvokeOptions<Value extends lib.Descriptor, AltValue = Value> = {
  flags: Flags;
  overrideBaseFlags: boolean;
  includeProjectIdFlag: boolean;
  pipe: {
    in?: string;
    out?: string;
  };
  error?: (result: Result) => Value | AltValue;
};

export async function gcloud<Value extends lib.Descriptor, AltValue = Value>(
  command: string,
  options?: Partial<InvokeOptions<Value, AltValue>>
) {
  const activeProjectId = projects.active?.get()?.projectId;
  const opt: InvokeOptions<Value, AltValue> = {
    flags: { ...(options?.flags || {}) },
    overrideBaseFlags: options?.overrideBaseFlags || false,
    includeProjectIdFlag:
      options?.includeProjectIdFlag === false
        ? false
        : options?.includeProjectIdFlag === true
          ? true
          : activeProjectId !== undefined &&
            !new RegExp(activeProjectId).test(command),
    pipe: {
      in: options?.pipe?.in || undefined,
      out: options?.pipe?.out || undefined
    },
    error: options?.error
  };
  if (!opt.overrideBaseFlags) {
    opt.flags = { ...opt.flags, ...flags.getBase() };
  }
  if (opt.includeProjectIdFlag) {
    opt.flags.project = activeProjectId;
  }
  const exec = `${
    opt.pipe.in ? `${opt.pipe.in} | ` : ''
  }gcloud ${command} ${flags.stringify(opt.flags)}${
    opt.pipe.out ? ` | ${opt.pipe.out}` : ''
  }`;
  const result = Shell.exec(exec);
  try {
    return JSON.parse(result.stdout) as Value;
  } catch (e) {
    if (opt.error) {
      return opt.error(result);
    } else {
      throw e;
    }
  }
}

export async function gcloudBeta<
  Value extends lib.Descriptor,
  AltValue = Value
>(command: string, options?: Partial<InvokeOptions<Value, AltValue>>) {
  return gcloud<Value, AltValue>(`beta ${command}`, options);
}
