import projects from '../projects';
import shell from '../shell';
import members from './members';
import roles from './roles';
import serviceAccounts from './serviceAccounts';

/** @see https://cloud.google.com/iam/docs/reference/rest/v1/Policy#Binding.FIELDS.members */
type UserType = 'user' | 'serviceAccount' | 'group';

type AddPolicyBindingOptions = {
  role: string;
  /** @deprecated use {@link AddPolicyBindingOptions.member} */
  user: string;
  member: string;
  userType: UserType;
};

type PolicyBinding = {
  members: string[];
  role: string;
};

type Policy = {
  bindings: PolicyBinding[];
  etag: string;
  version: number;
};

export default {
  /** @deprecated use {@link roles} */
  Roles: roles,
  roles,
  serviceAccounts,

  addPolicyBinding: async function({
    user,
    member,
    userType = 'user',
    role
  }: Partial<AddPolicyBindingOptions>) {
    member = await members.inputIdentifier({
      member: member || user,
      purpose: 'add policy binding'
    });
    role = await roles.inputIdentifier({ role, purpose: `bind to ${member}` });
    return shell.gcloud<Policy>(
      `projects add-iam-policy-binding ${projects.active.get()} --member="${userType}:${member}" --role="${role}"`
    );
  }
};
