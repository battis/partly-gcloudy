/** @see https://cloud.google.com/iam/docs/reference/rest/v1/Policy#Binding.FIELDS.members */
export type UserType = 'user' | 'serviceAccount' | 'group' | 'domain';

export const User: UserType = 'user';
export const ServiceAccount: UserType = 'serviceAccount';
export const Group: UserType = 'group';
export const Domain: UserType = 'domain';
