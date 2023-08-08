import projects from '../projects';
import shell from '../shell';
import TPolicy from './Policy';
import MRole from './Role';
import MMembers from './members';
import MServiceAccounts from './serviceAccounts';

class iam {
  protected constructor() {
    // ignore
  }

  public static async addPolicyBinding({
    user,
    member,
    userType = 'user',
    role,
    projectId
  }: {
    role?: string;
    /** @deprecated use {@link AddPolicyBindingOptions.member} */
    user?: string;
    member?: string;
    userType?: string | iam.members.UserType;
    projectId?: string;
  } = undefined) {
    member = await iam.members.inputIdentifier({
      member: member || user,
      purpose: 'to whom to add policy binding'
    });
    userType = await iam.members.selectUserType({
      userType: userType.toString()
    });
    role = await iam.Role.inputIdentifier({
      role,
      purpose: `bind to ${member}`
    });
    projectId = await projects.selectIdentifier({ projectId });
    return shell.gcloud<iam.Policy>(
      `projects add-iam-policy-binding ${projectId} --member=${userType}:${member} --role=${role}`
    );
  }
}

namespace iam {
  export type Policy = TPolicy;
  export import Role = MRole; // eslint-disable-line @typescript-eslint/no-unused-vars
  export import serviceAccounts = MServiceAccounts; // eslint-disable-line @typescript-eslint/no-unused-vars
  export import members = MMembers; // eslint-disable-line @typescript-eslint/no-unused-vars
}

export { iam as default };
