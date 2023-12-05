export type Flags = {
  [flag: string]: string | true | undefined;
  project?: string;
  quiet?: true;
  format?: string;
};

let base: Flags = { quiet: true, format: 'json' };

export function getBase() {
  return base;
}

export function setBase(flags: Partial<Flags>) {
  return (base = flags);
}

export function stringify(flags: Flags) {
  return Object.keys(flags)
    .map((f) =>
      f.length > 1
        ? `--${f}${flags[f] === true ? '' : `=${flags[f]}`}`
        : `-${f}${flags[f] === true ? '' : flags[f]}`
    )
    .join(' ');
}
