import cli from '@battis/qui-cli';
import Policy from './iam/Policy.js';
import * as Role from './iam/Role.js';
import * as members from './iam/members.js';
import * as serviceAccounts from './iam/serviceAccounts.js';
import * as projects from './projects.js';
import * as shell from './shell.js';

export async function addPolicyBinding({
  user,
  member,
  userType = 'user',
  role,
  projectId,
  ...rest
}: {
  role?: string;
  /** @deprecated use {@link member} */
  user?: string;
  member?: string;
  userType?: members.UserType;
  projectId?: string;
} & Partial<Parameters<typeof members.inputIdentifier>[0]> &
  Partial<Parameters<typeof members.selectUserType>[0]> &
  Partial<Parameters<typeof projects.selectIdentifier>[0]> &
  Partial<Parameters<typeof Role.inputIdentifier>[0]> &
  Partial<Parameters<typeof projects.selectIdentifier>[0]> = {}) {
  member = await members.inputIdentifier({
    member: member || user,
    purpose: 'to whom to add policy binding',
    ...rest
  });
  userType = await members.selectUserType({
    userType,
    ...rest
  });
  role = await Role.inputIdentifier({
    role,
    purpose: `bind to ${cli.colors.value(member)}`,
    ...rest
  });
  projectId = await projects.selectIdentifier({ projectId, ...rest });
  return await shell.gcloud<Policy>(
    `projects add-iam-policy-binding ${projectId} --member=${userType}:${member} --role=${role}`
  );
}
export { Role, members, serviceAccounts, type Policy };
