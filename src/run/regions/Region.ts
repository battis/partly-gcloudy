import { PathString } from '@battis/descriptive-types';

export type Region = {
  displayName: string;
  labels: { [label: string]: string };
  locationId: string;
  name: PathString;
};
