import lib from '../lib';
import { SelectOptions } from '../lib/prompts/select';
import projects from '../projects';
import shell from '../shell';
import members from './members';
import roles from './roles';
import serviceAccounts from './serviceAccounts';

/** @see https://cloud.google.com/iam/docs/reference/rest/v1/Policy#Binding.FIELDS.members */
type UserType = 'user' | 'serviceAccount' | 'group';

const isUserType = (u: string): u is UserType =>
  ['user', 'serviceAccount', 'group'].includes(u);

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

type SelectUserTypeOptions = Partial<SelectOptions> & {
  userType?: string;
};

async function selectUserType(options?: SelectUserTypeOptions) {
  const { userType, ...rest } = options;
  return await lib.prompts.select<UserType>({
    arg: userType,
    validate: isUserType,
    message: `IAM user type`,
    choices: () =>
      ['user', 'serviceAccount', 'group'].map((t) => ({ value: t })),
    ...rest
  });
}

export default {
  /** @deprecated use {@link roles} */
  Roles: roles,
  roles,
  serviceAccounts,

  addPolicyBinding: async function(
    options?: Partial<AddPolicyBindingOptions>
  ) {
    const { user } = options;
    let { member, userType = 'user', role } = options;
    member = await members.inputIdentifier({
      member: member || user,
      purpose: 'to whom to add policy binding'
    });
    userType = (await selectUserType({ userType })) as UserType;
    role = await roles.inputIdentifier({ role, purpose: `bind to ${member}` });
    return shell.gcloud<Policy>(
      `projects add-iam-policy-binding ${projects.active.get()} --member=${userType}:${member} --role=${role}`
    );
  }
};
