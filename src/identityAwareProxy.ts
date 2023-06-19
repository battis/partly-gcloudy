import cli from '@battis/cli';
import path from 'node:path';
import invoke from './invoke';
import * as project from './project';
import * as services from './services';

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

const splitUsers = (value: string) =>
  value?.split(',').map((part) => part.trim()) || [];

export default async function enable({
  applicationTitle, // defaults to project name if undefined
  supportEmail,
  users = [] // defaults to supportEmail if empty
}: Partial<EnableOptions>) {
  await services.enable({ service: services.API.IdentityAwareProxyAPI });
  const proj = await project.describe();
  let [brand] = await invoke<OAuthBrand[]>(
    `iap oauth-brands list --filter=name=projects/${proj.projectNumber}/brands/${proj.projectNumber}`
  );
  // TODO allow arg-based config for brand and client?
  if (!brand) {
    applicationTitle =
      applicationTitle ||
      (await cli.io.prompts.input({
        message: 'Application title for OAuth consent dialog',
        validate: cli.io.validators.notEmpty,
        default: proj.name
      }));
    supportEmail =
      supportEmail ||
      (await cli.io.prompts.input({
        message: 'Support email from OAuth consent dialog',
        validate: cli.io.validators.email
      }));
    brand = await invoke<OAuthBrand>(
      `iap oauth-brands create --application_title="${applicationTitle || proj.name
      }" --support_email=${supportEmail}`
    );
  }
  let [client] = await invoke<OAuthClient[]>(
    `iap oauth-clients list ${brand.name}`
  );
  if (!client) {
    client = await invoke<OAuthClient>(
      `iap oauth-clients create ${brand.name} --display_name=IAP-App-Engine-app`
    );
  }
  await invoke(
    `iap web enable --resource-type=app-engine --oauth2-client-id=${path.basename(
      client.name
    )} --oauth2-client-secret=${client.secret}`
  );
  users =
    users.length > 0
      ? users
      : splitUsers(
        await cli.io.prompts.input({
          message: 'Users with access to app via IAP (comma-separated)',
          validate: (value?: string) =>
            (cli.io.validators.notEmpty(value) === true &&
              splitUsers(value || '')
                .map(cli.io.validators.email)
                .reduce(
                  (valid: boolean, test) => valid && test === true,
                  true
                )) ||
            'Must be comma-separated list of valid emails'
        })
      );
  users.forEach(
    async (user) =>
      await invoke(
        `projects add-iam-policy-binding ${project.getId()} --member="user:${user}" --role="roles/iap.httpsResourceAccessor"`
      )
  );
}
