import * as iam from '#iam';
import * as projects from '#projects';

export enum AccessLevel {
  readOnly,
  readWrite
}

type Options = {
  serviceAccount: string | iam.serviceAccounts.ServiceAccount;
  accessLevel?: AccessLevel;
};

export async function enableServiceAccountSecretsAccess({
  serviceAccount,
  accessLevel = AccessLevel.readOnly
}: Options) {
  if (typeof serviceAccount !== 'string') {
    serviceAccount = serviceAccount.email;
  }

  await projects.addIamPolicyBinding({
    member: serviceAccount,
    userType: 'serviceAccount',
    role: iam.Role.SecretManager.SecretAccessor
  });

  if (accessLevel === AccessLevel.readWrite) {
    await projects.addIamPolicyBinding({
      member: serviceAccount,
      userType: 'serviceAccount',
      role: 'roles/secretmanager.secretVersionManager'
    });
  }
}
