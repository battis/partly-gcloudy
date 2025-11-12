import { factory } from './factory.js';
import { select } from './select.js';

export * from './Client.js';
export * from './create.js';
export * from './describe.js';
export * from './factory.js';
export * from './list.js';
export * from './select.js';

/** @deprecated Use factory() */
export const selectClient = factory;

/** @deprecated Use select() */
export const selectName = select;
export const selectIdentifier = select;
