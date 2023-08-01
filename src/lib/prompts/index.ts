import confirmReuse from './confirmReuse';
import * as core from './core';
import input, { InputOptions as _InputOptions } from './input';
import select, { SelectOptions as _SelectOptions } from './select';

export type InputOptions<T extends string> = _InputOptions<T>;
export type SelectOptions = _SelectOptions;

export default {
  ...core,
  select,
  input,
  confirmReuse
};
