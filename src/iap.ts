import cli from '@battis/qui-cli';
import path from 'path';
import project from './project';
import services from './services';
import shell from './shell';

type OAuthBrand = {
  applicationTitle: string;
  name: string;
  orgInternalOnly: boolean;
  supportEmail: string;
};

type OAuthClient = {
  displayName: string;
  name: string;
  secret: string;
};

type EnableOptions = {
  applicationTitle: string;
  supportEmail: string;
  users: string[];
};

export default {
  enable: async function({
    applicationTitle, // defaults to project name if undefined
    supportEmail,
    users = [] // defaults to supportEmail if empty
  }: Partial<EnableOptions>) {
    await services.enable({ service: services.API.IdentityAwareProxyAPI });
    const proj = await project.describe();
    let [brand] = shell.gcloud<OAuthBrand[]>(
      `iap oauth-brands list --filter=name=projects/${proj.projectNumber}/brands/${proj.projectNumber}`
    );
    // TODO allow arg-based config for brand and client?
    if (!brand) {
      applicationTitle =
        applicationTitle ||
        (await cli.prompts.input({
          message: 'Application title for OAuth consent dialog',
          validate: cli.validators.notEmpty,
          default: proj.name
        }));
      supportEmail =
        supportEmail ||
        (await cli.prompts.input({
          message: 'Support email from OAuth consent dialog',
          validate: cli.validators.email
        }));
      brand = shell.gcloud<OAuthBrand>(
        `iap oauth-brands create --application_title="${applicationTitle || proj.name
        }" --support_email=${supportEmail}`
      );
    }
    let [client] = shell.gcloud<OAuthClient[]>(
      `iap oauth-clients list ${brand.name}`
    );
    if (!client) {
      client = shell.gcloud<OAuthClient>(
        `iap oauth-clients create ${brand.name} --display_name=IAP-App-Engine-app`
      );
    }
    shell.gcloud(
      `iap web enable --resource-type=app-engine --oauth2-client-id=${path.basename(
        client.name
      )} --oauth2-client-secret=${client.secret}`
    );

    const splitUsers = (value: string) =>
      value?.split(',').map((part) => part.trim()) || [];

    users =
      users.length > 0
        ? users
        : splitUsers(
          await cli.prompts.input({
            message: 'Users with access to app via IAP (comma-separated)',
            validate: (value?: string) =>
              (cli.validators.notEmpty(value) === true &&
                splitUsers(value || '')
                  .map(cli.validators.email)
                  .reduce(
                    (valid: boolean, test) => valid && test === true,
                    true
                  )) ||
              'Must be comma-separated list of valid emails'
          })
        );
    users.forEach(async (user) =>
      shell.gcloud(
        `projects add-iam-policy-binding ${project.id.get()} --member="user:${user}" --role="roles/iap.httpsResourceAccessor"`
      )
    );
  }
};
