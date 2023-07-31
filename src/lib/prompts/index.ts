import confirmReuse from './confirmReuse';
import * as core from './core';
import input, { InputOptions as _InputOptions } from './input';
import inputPath from './inputPath';
import select, { SelectOptions as _SelectOptions } from './select';

export type InputOptions<T extends string> = _InputOptions<T>;
export type SelectOptions<T extends string> = _SelectOptions<T>;

export default {
  ...core,
  inputPath,
  select,
  input,
  confirmReuse
};
