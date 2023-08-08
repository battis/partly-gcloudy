import cli from '@battis/qui-cli';
import path from 'path';
import iam from '../iam';
import lib from '../lib';
import projects from '../projects';
import services from '../services';
import shell from '../shell';
import MOAuthBrands from './oauthBrands';
import MOAuthClients from './oauthClients';

class iap {
  protected constructor() {
    // ignore
  }

  private static splitUsers = (value: string) =>
    value?.split(',').map((part) => part.trim()) || [];

  public static async inputUsers({
    users,
    validate,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input>[0]> & {
    users?: string | string[];
  } = undefined) {
    if (Array.isArray(users)) {
      users = users.join(',');
    }
    return this.splitUsers(
      await lib.prompts.input({
        arg: users,
        message: 'Users with access to app via IAP (comma-separated)',
        validate: cli.validators.combine(
          validate,
          (value?: string) =>
            (cli.validators.notEmpty(value) === true &&
              this.splitUsers(value || '')
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

  public static async enable({
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
  } = undefined) {
    await services.enable({ service: services.API.IdentityAwareProxyAPI });
    if (project) {
      projectId = project.projectId;
    } else if (projectId) {
      project = await projects.describe({ projectId });
    } else {
      project = await projects.selectProject({
        project,
        purpose: 'for which set up IAP access'
      });
      projectId = project.projectId;
    }
    brand = await iap.oauthBrands.selectBrand({
      brand,
      applicationTitle,
      supportEmail,
      project
    });
    brand = await iap.oauthBrands.selectBrand({ brand });
    const client = await iap.oauthClients.selectClient({
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

    users = await this.inputUsers({ users });
    users.forEach(async (user) =>
      iam.addPolicyBinding({
        member: user,
        role: iam.Role.IAP.WebUser,
        projectId: project.projectId
      })
    );
  }
}

namespace iap {
  export import oauthClients = MOAuthClients; // eslint-disable-line @typescript-eslint/no-unused-vars
  export import oauthBrands = MOAuthBrands; // eslint-disable-line @typescript-eslint/no-unused-vars
}

export { iap as default };
