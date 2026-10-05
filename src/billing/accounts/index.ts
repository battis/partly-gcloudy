import { select } from './select.js';

export * from './Account.js';
export * from './active.js';
export * from './describe.js';
export * from './list.js';
export * from './select.js';

export const selectIdentifier = select;

/** @deprecated Use {@link select()} */
export const selectName = select;

/** @deprecated Use {@link selectIdentifier()} */
export const selectidentifier = selectIdentifier;
