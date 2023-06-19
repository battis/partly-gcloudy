import { execSync } from 'child_process';
import * as flags from './flags';
import * as project from './project';

export type InvokeOptions = {
  flags: flags.Flags;
  oerrideBaseFlags: boolean;
  includeProjectIdFlag: boolean;
  pipe: {
    in?: string;
    out?: string;
  };
};

export default async function invoke<T>(
  command: string,
  options?: Partial<InvokeOptions>
) {
  const opt: InvokeOptions = {
    flags: { ...(options?.flags || {}) },
    oerrideBaseFlags: options?.oerrideBaseFlags || false,
    includeProjectIdFlag:
      options?.includeProjectIdFlag === false
        ? false
        : !new RegExp(project.getId()).test(command) && true,
    pipe: {
      in: options?.pipe?.in || undefined,
      out: options?.pipe?.out || undefined
    }
  };
  if (!opt.oerrideBaseFlags) {
    opt.flags = { ...opt.flags, ...flags.getBase() };
  }
  if (opt.includeProjectIdFlag) {
    opt.flags.project = project.getId();
  }
  const result = execSync(
    `${opt.pipe.in ? `${opt.pipe.in} |` : ''
    }gcloud ${command} ${flags.stringify(opt.flags)}${opt.pipe.out ? `| ${opt.pipe.out}` : ''
    }`
  );
  return (await result.toJSON()) as T;
}
