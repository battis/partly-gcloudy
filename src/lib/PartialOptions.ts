export type PartialOptions<F extends (...args: any[]) => any> = Partial<
  Parameters<F>[0]
>;
