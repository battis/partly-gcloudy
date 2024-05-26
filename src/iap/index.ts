import * as iam from '../iam';
import * as lib from '../lib';
import type { Email } from '../lib';
import * as projects from '../projects';
import * as services from '../services';
import * as shell from '../shell';
import * as oauthBrands from './oauthBrands';
import * as oauthClients from './oauthClients';
import cli from '@battis/qui-cli';
import path from 'path';

function splitUsers(value: string) {
  return value?.split(',').map((part) => part.trim()) || [];
}

export async function inputUsers({
  users,
  validate,
  ...rest
}: {
  users?: string | string[];
} & Partial<Parameters<typeof lib.prompts.input>[0]> = {}) {
  if (Array.isArray(users)) {
    users = users.join(',');
  }
  return splitUsers(
    await lib.prompts.input({
      arg: users,
      message: 'Users with access to app via IAP (comma-separated)',
      validate: cli.validators.combine(
        validate,
        (value?: string) =>
          (cli.validators.notEmpty(value) === true &&
            splitUsers(value || '')
              .map(cli.validators.email)
              .reduce(
                (valid: boolean, test) => valid && test === true,
                true
              )) ||
          'Must be comma-separated list of valid emails'
      ),
      ...rest
    })
  );
}

export async function enable({
  users,
  applicationTitle, // defaults to project name if undefined
  supportEmail,
  project,
  projectId,
  brand,
  client: clientArg,
  ...rest
}: {
  applicationTitle?: string;
  supportEmail?: string;
  users?: string | Email[];
  project?: projects.Project;
  projectId?: string;
  brand?: string;
  client?: string;
} & Partial<Parameters<typeof projects.selectProject>[0]> &
  Partial<Parameters<typeof oauthBrands.selectBrand>[0]> &
  Partial<Parameters<typeof oauthClients.selectClient>[0]> &
  Partial<Parameters<typeof iam.addPolicyBinding>[0]> = {}) {
  await services.enable(services.API.CloudIdentityAwareProxyAPI);
  projectId =
    projectId ||
    (
      await projects.selectProject({
        project,
        id: projectId,
        purpose: 'for which set up IAP access',
        ...rest
      })
    ).projectId;

  brand = await oauthBrands.selectBrand({
    brand,
    applicationTitle,
    supportEmail,
    project,
    ...rest
  });
  const client = await oauthClients.selectClient({
    brand,
    name: clientArg,
    purpose: 'for IAP access',
    default: 'IAP-App-Engine-app',
    project,
    ...rest
  });
  await shell.gcloud(
    `iap web enable --resource-type=app-engine --oauth2-client-id=${path.basename(
      client.name
    )} --oauth2-client-secret=${client.secret}`
  );

  users = await inputUsers({ users });
  users.forEach(async (user) =>
    iam.addPolicyBinding({
      member: user,
      role: iam.Role.IAP.WebUser,
      projectId,
      ...rest
    })
  );
}

export { oauthBrands, oauthClients };
