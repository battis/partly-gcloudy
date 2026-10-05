import * as iam from '#iam';
import * as lib from '#lib';
import { gcloud } from '#shell';
import { Colors } from '@qui-cli/colors';
import { select } from './select.js';
import { active } from './active.js';

export async function addIamPolicyBinding({
  user,
  member,
  userType = 'user',
  role,
  projectId,
  ...options
}: Options = {}) {
  if (member) {
    if (
      member !== 'AllUsers' &&
      member !== 'AllAuthenticatedUsers' &&
      !/^(user|group|serviceAccount|domain):.+/.test(member)
    ) {
      user = member;
      member = undefined;
    }
  }
  member =
    member ||
    `${await iam.members.UserType.select({
      userType,
      ...options
    })}:${await iam.members.inputIdentifier({
      member: user,
      purpose: 'to whom to add policy binding',
      ...options
    })}`;
  role = await iam.Role.inputIdentifier({
    role,
    purpose: `bind to ${Colors.value(member)}`,
    ...options
  });
  projectId =
    projectId ||
    active.get()?.projectId ||
    (await select({ projectId, ...options }));
  return await gcloud<iam.Policy>(
    `projects add-iam-policy-binding ${projectId}`,
    {
      flags: { member, role },
      includeProjectIdFlag: false
    }
  );
}

export namespace addIamPolicyBinding {
  export type Options = {
    /**
     * The principal to add the binding for. Should be of the form
     * `user|group|serviceAccount:email` or `domain:domain`. Examples:
     * `user:test-user@gmail.com`, `group:admins@example.com`,
     * `serviceAccount:test123@example.domain.com`, or
     * `domain:example.domain.com`.
     *
     * Some resources also accept the following special values:
     *
     * - `AllUsers` - Special identifier that represents anyone who is on the
     *   internet, with or without a Google account.
     * - `AllAuthenticatedUsers` - Special identifier that represents anyone who is
     *   authenticated with a Google account or a service account.
     *
     * A complete `member` definition takes precedence over {@link userType} and
     * {@link user}. A `member` without a usertype: prefix will be treated as
     * {@link user} value
     */
    member?: string;
    /**
     * Role name to assign to the principal. The role name is the complete path of
     * a predefined role, such as `roles/logging.viewer`, or the role ID for a
     * custom role, such as
     * `organizations/{ORGANIZATION_ID}/roles/logging.viewer`.
     */
    role?: string;
    /** Email address or domain of member */
    user?: string;
    userType?: iam.members.UserType;
    projectId?: string;
  } & lib.PartialOptions<typeof iam.members.inputIdentifier> &
    lib.PartialOptions<typeof iam.members.UserType.select> &
    lib.PartialOptions<typeof iam.Role.inputIdentifier> &
    lib.PartialOptions<typeof select>;
}
