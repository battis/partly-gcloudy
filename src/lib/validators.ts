import { Colors } from '@battis/qui-cli.colors';
import { Descriptor } from './Descriptor.js';

export function exclude<T = string | Descriptor>({
  exclude,
  property
}: T extends Descriptor
  ? { exclude: T; property: string }
  : { exclude: string; property?: undefined }) {
  return (value?: string) =>
    (value &&
      (property ? value !== exclude[property] : property !== exclude)) ||
    `Cannot reuse ${Colors.quotedValue(`"${value}"`)}`;
}
