import cli from '@battis/qui-cli';
import * as lib from '../lib';
import activeProject from '../projects/active';
import * as flags from './flags';

export type InvokeOptions<Value extends lib.Descriptor, AltValue = Value> = {
  flags: Flags;
  overrideBaseFlags: boolean;
  includeProjectIdFlag: boolean;
  pipe: {
    in?: string;
    out?: string;
  };
  error?: (result: any) => Value | AltValue;
};

export async function gcloud<Value extends lib.Descriptor, AltValue = Value>(
  command: string,
  options?: Partial<InvokeOptions<Value, AltValue>>
) {
  const activeProjectId = activeProject?.get()?.projectId;
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
  const result = cli.shell.exec(
    `${
      opt.pipe.in ? `${opt.pipe.in} |` : ''
    }gcloud ${command} ${flags.stringify(opt.flags)}${
      opt.pipe.out ? `| ${opt.pipe.out}` : ''
    }`
  );
  if (result.stderr.length) {
    if (opt.error) {
      return opt.error(result);
    } else {
      throw new Error(result.stderr);
    }
  }
  try {
    return JSON.parse(result.stdout) as Value;
  } catch (e) {
    return undefined as unknown as Value; // FIXME this is probably unwise
  }
}

export async function gcloudBeta<
  Value extends lib.Descriptor,
  AltValue = Value
>(command: string, options?: Partial<InvokeOptions<Value, AltValue>>) {
  return gcloud<Value, AltValue>(`beta ${command}`, options);
}

export type Flags = flags.Flags;

export { flags };
