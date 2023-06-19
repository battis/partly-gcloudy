import productionInvoke, { InvokeOptions } from './invoke';

export function invoke<T>(command: string, options?: Partial<InvokeOptions>) {
  return productionInvoke<T>(`beta ${command}`, options);
}
