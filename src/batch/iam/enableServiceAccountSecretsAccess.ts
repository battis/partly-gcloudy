import * as iam from '#iam';
import * as projects from '#projects';

export async function enableServiceAccountSecretsAccess({
  serviceAccount,
  accessLevel = enableServiceAccountSecretsAccess.AccessLevel.readOnly
}: enableServiceAccountSecretsAccess.Options) {
  if (typeof serviceAccount !== 'string') {
    serviceAccount = serviceAccount.email;
  }

  await projects.addIamPolicyBinding({
    userType: iam.members.UserType.ServiceAccount,
    user: serviceAccount,
    role: iam.Role.SecretManager.SecretAccessor
  });

  if (accessLevel === enableServiceAccountSecretsAccess.AccessLevel.readWrite) {
    await projects.addIamPolicyBinding({
      userType: iam.members.UserType.ServiceAccount,
      user: serviceAccount,
      role: iam.Role.SecretManager.SecretVersionManager
    });
  }
}

export namespace enableServiceAccountSecretsAccess {
  /** Simplified presentation of {@link iam.Role.SecretManager} roles */
  export enum AccessLevel {
    readOnly,
    readWrite
  }

  export type Options = {
    serviceAccount: string | iam.serviceAccounts.ServiceAccount;
    accessLevel?: AccessLevel;
  } & Partial<projects.addIamPolicyBinding.Options>;
}
