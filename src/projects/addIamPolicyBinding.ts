import { Colors } from '@qui-cli/colors';
import * as iam from '../iam/index.js';
import * as projects from '../projects/index.js';
import * as shell from '../shell/index.js';

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
  Partial<Parameters<typeof projects.select>[0]> = {}) {
  member = await iam.members.inputIdentifier({
    member: member || user,
    purpose: 'to whom to add policy binding',
    ...rest
  });
  userType = await iam.members.selectUserType({
    userType,
    ...rest
  });
  role = await iam.Role.inputIdentifier({
    role,
    purpose: `bind to ${Colors.value(member)}`,
    ...rest
  });
  projectId = await projects.select({ projectId, ...rest });
  return await shell.gcloud<iam.Policy>(
    `projects add-iam-policy-binding ${projectId} --member=${userType}:${member} --role=${role}`
  );
}
