/* eslint-disable @typescript-eslint/no-namespace */

import { select as s } from './select.js';
import { UserType as UT } from './UserType.js';

export type UserType = UT;

export namespace UserType {
  export const select = s;
}

export { UserType as default };
