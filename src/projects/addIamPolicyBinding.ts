import * as iam from '#iam';
import { gcloud } from '#shell';
import { Colors } from '@qui-cli/colors';
import { select } from './select.js';

export async function addIamPolicyBinding({
  user,
  member,
  userType = 'user',
  role,
  projectId,
  ...rest
}: {
  role?: string;
  /** @deprecated Use {@link member} */
  user?: string;
  member?: string;
  userType?: iam.members.UserType;
  projectId?: string;
} & Partial<Parameters<typeof iam.members.inputIdentifier>[0]> &
  Partial<Parameters<typeof iam.members.UserType.select>[0]> &
  Partial<Parameters<typeof iam.Role.inputIdentifier>[0]> &
  Partial<Parameters<typeof select>[0]> = {}) {
  member = await iam.members.inputIdentifier({
    member: member || user,
    purpose: 'to whom to add policy binding',
    ...rest
  });
  userType = await iam.members.UserType.select({
    userType,
    ...rest
  });
  role = await iam.Role.inputIdentifier({
    role,
    purpose: `bind to ${Colors.value(member)}`,
    ...rest
  });
  projectId = await select({ projectId, ...rest });
  return await gcloud<iam.Policy>(
    `projects add-iam-policy-binding ${projectId} --member=${userType}:${member} --role=${role}`
  );
}
