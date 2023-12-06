import cli from '@battis/qui-cli';
import path from 'path';
import * as iam from '../iam';
import * as lib from '../lib';
import * as projects from '../projects';
import * as services from '../services';
import * as shell from '../shell';
import * as oauthBrands from './oauthBrands';
import * as oauthClients from './oauthClients';

function splitUsers(value: string) {
  return value?.split(',').map((part) => part.trim()) || [];
}

export async function inputUsers({
  users,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input>[0]> & {
  users?: string | string[];
} = {}) {
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
  client: clientArg
}: {
  applicationTitle?: string;
  supportEmail?: string;
  users?: string | lib.Email[];
  project?: projects.Project;
  projectId?: string;
  brand?: string;
  client?: string;
} = {}) {
  await services.enable({ service: services.API.IdentityAwareProxyAPI });
  if (project) {
    projectId = project.projectId;
  } else if (!project && !projectId) {
    projectId = (
      await projects.selectProject({
        project,
        purpose: 'for which set up IAP access'
      })
    ).projectId;
  }
  brand = await oauthBrands.selectBrand({
    brand,
    applicationTitle,
    supportEmail,
    project
  });
  brand = await oauthBrands.selectBrand({ brand });
  const client = await oauthClients.selectClient({
    brand,
    name: clientArg,
    purpose: 'for IAP access',
    default: 'IAP-App-Engine-app'
  });
  shell.gcloud(
    `iap web enable --resource-type=app-engine --oauth2-client-id=${path.basename(
      client.name
    )} --oauth2-client-secret=${client.secret}`
  );

  users = await inputUsers({ users });
  users.forEach(async (user) =>
    iam.addPolicyBinding({
      member: user,
      role: iam.Role.IAP.WebUser,
      projectId
    })
  );
}

export { oauthBrands, oauthClients };
