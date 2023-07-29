export type Flags = {
  [flag: string]: string | true | undefined;
  project?: string;
  quiet?: true;
  format?: string;
};

let base: Flags = { quiet: true, format: 'json' };

export default {
  getBase: () => base,
  setBase: (flags: Partial<Flags>) => (base = flags),

  stringify: (flags: Flags) =>
    Object.keys(flags)
      .map((f) =>
        f.length > 1
          ? `--${f}${flags[f] === true ? '' : `=${flags[f]}`}`
          : `-${f}${flags[f] === true ? '' : flags[f]}`
      )
      .join(' ')
};
