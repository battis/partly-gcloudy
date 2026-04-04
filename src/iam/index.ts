import { addIamPolicyBinding } from '../projects/addIamPolicyBinding.js';

export * as members from './members/index.js';
export * from './Policy.js';
export * as Role from './Role.js';
export * as serviceAccounts from './serviceAccounts/index.js';

/** @deprecated Use {@link addIamPolicyBinding}() */
export const addPolicyBinding = addIamPolicyBinding;
