import cli from '@battis/qui-cli';
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
    `Cannot reuse ${cli.colors.quotedValue(`"${value}"`)}`;
}
