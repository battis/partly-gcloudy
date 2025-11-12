import { input } from './input.js';
import UserType from './UserType/index.js';

export * from './input.js';
export { default as UserType } from './UserType/index.js';

/** @deprecated Use {@link UserType.select} */
export const selectUserType = UserType.select;

/** @deprecated Use {@link input} */
export const inputMember = input;
export const inputIdentifier = input;
