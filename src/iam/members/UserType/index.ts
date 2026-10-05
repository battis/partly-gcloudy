/* eslint-disable @typescript-eslint/no-namespace */

import { select as sel } from './select.js';
import {
  UserType as UT,
  User as u,
  Group as g,
  ServiceAccount as s,
  Domain as d
} from './UserType.js';

export type UserType = UT;

export namespace UserType {
  export const select = sel;
  export const User = u;
  export const Groups = g;
  export const ServiceAccount = s;
  export const Domain = d;
}

export { UserType as default };
