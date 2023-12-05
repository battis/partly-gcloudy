import cli from '@battis/qui-cli';
import * as lib from '../lib';
import activeProject from '../projects/active';
import * as flags from './flags';

type InvokeOptions = {
  flags: Flags;
  overrideBaseFlags: boolean;
  includeProjectIdFlag: boolean;
  pipe: {
    in?: string;
    out?: string;
  };
};

export function gcloud<T extends lib.Descriptor>(
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
        : !new RegExp(activeProject.get().projectId).test(command),
    pipe: {
      in: options?.pipe?.in || undefined,
      out: options?.pipe?.out || undefined
    }
  };
  if (!opt.overrideBaseFlags) {
    opt.flags = { ...opt.flags, ...flags.getBase() };
  }
  if (opt.includeProjectIdFlag) {
    opt.flags.project = activeProject.get().projectId;
  }
  const result = cli.shell.exec(
    `${
      opt.pipe.in ? `${opt.pipe.in} |` : ''
    }gcloud ${command} ${flags.stringify(opt.flags)}${
      opt.pipe.out ? `| ${opt.pipe.out}` : ''
    }`
  ).stdout;
  try {
    return JSON.parse(result) as T;
  } catch (e) {
    return undefined as T;
  }
}

export function gcloudBeta<T>(
  command: string,
  options?: Partial<InvokeOptions>
) {
  return gcloud<T>(`beta ${command}`, options);
}

export type Flags = flags.Flags;

export { flags };
