import * as iam from '#iam';
import * as lib from '#lib';
import * as projects from '#projects';
import * as services from '#services';
import { gcloud } from '#shell';
import path from 'node:path';
import * as oauthBrands from '../oauthBrands/index.js';
import * as oauthClients from '../oauthClients/index.js';
import { inputUsers } from './inputUsers.js';

type Options = {
  applicationTitle?: string;
  supportEmail?: string;
  users?: string | lib.Email[];
  project?: projects.Project;
  projectId?: string;
  brand?: string;
  client?: string;
} & lib.PartialOptions<typeof projects.factory> &
  lib.PartialOptions<typeof oauthBrands.select> &
  lib.PartialOptions<typeof oauthClients.factory> &
  lib.PartialOptions<typeof projects.addIamPolicyBinding>;

export async function enable({
  users,
  applicationTitle, // defaults to project name if undefined
  supportEmail,
  project,
  projectId,
  brand,
  client: clientArg,
  ...rest
}: Options = {}) {
  await services.enable(services.API.CloudIdentityAwareProxyAPI);
  projectId =
    projectId ||
    (
      await projects.factory({
        project,
        id: projectId,
        purpose: 'for which set up IAP access',
        ...rest
      })
    ).projectId;

  brand = await oauthBrands.select({
    brand,
    applicationTitle,
    supportEmail,
    project,
    ...rest
  });
  const client = await oauthClients.factory({
    brand,
    name: clientArg,
    purpose: 'for IAP access',
    default: 'IAP-App-Engine-app',
    project,
    ...rest
  });
  await gcloud('iap web enable', {
    flags: {
      'resource-type': 'app-engine',
      'oauth2-client-id': path.basename(client.name),
      'oauth2-client-secret': client.secret
    }
  });

  users = await inputUsers({ users });
  users.forEach(async (user: string) =>
    projects.addIamPolicyBinding({
      member: user,
      role: iam.Role.IAP.httpsResourceAccessor,
      projectId,
      ...rest
    })
  );
}
