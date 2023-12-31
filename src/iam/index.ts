import * as projects from '../projects';
import * as shell from '../shell';
import Policy from './Policy';
import * as Role from './Role';
import * as members from './members';
import * as serviceAccounts from './serviceAccounts';

export async function addPolicyBinding({
  user,
  member,
  userType = 'user',
  role,
  projectId
}: {
  role?: string;
  /** @deprecated use {@link member} */
  user?: string;
  member?: string;
  userType?: members.UserType;
  projectId?: string;
} = {}) {
  member = await members.inputIdentifier({
    member: member || user,
    purpose: 'to whom to add policy binding'
  });
  userType = await members.selectUserType({
    userType
  });
  role = await Role.inputIdentifier({
    role,
    purpose: `bind to ${member}`
  });
  projectId = await projects.selectIdentifier({ projectId });
  return await shell.gcloud<Policy>(
    `projects add-iam-policy-binding ${projectId} --member=${userType}:${member} --role=${role}`
  );
}
export { Role, serviceAccounts, members, type Policy };
