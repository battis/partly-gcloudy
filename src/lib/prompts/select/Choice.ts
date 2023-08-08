import Descriptor from '../../Descriptor';

type Choice<T = string> = (T extends Descriptor
  ? { name: string }
  : { name?: string }) & {
    description?: string;
    value: T;
    disabled?: boolean;
  };

export type { Choice as default };
