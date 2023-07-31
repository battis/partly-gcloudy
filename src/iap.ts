import cli from '@battis/qui-cli';
import path from 'path';
import lib, { Email } from './lib';
import { InputOptions } from './lib/prompts';
import projects from './projects';
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
  users: string | Email[];
};

type ApplicationTitle = string;

type InputApplicationTitleOptions = Partial<InputOptions<ApplicationTitle>> & {
  applicationTitle?: string;
};

async function inputApplicationTitle(options?: InputApplicationTitleOptions) {
  const { applicationTitle, ...rest } = options;
  return await lib.prompts.input({
    arg: applicationTitle,
    message: 'Application title for OAuth consent dialog',
    validate: cli.validators.notEmpty,
    ...rest
  });
}

type InputSupportEmailOptions = Partial<InputOptions<Email>> & {
  supportEmail?: string;
};

async function inputSupportEmail(options?: InputSupportEmailOptions) {
  const { supportEmail, ...rest } = options;
  return await lib.prompts.input({
    arg: supportEmail,
    message: 'Support email from OAuth consent dialog',
    validate: cli.validators.email,
    default: supportEmail,
    ...rest
  });
}

const splitUsers = (value: string) =>
  value?.split(',').map((part) => part.trim()) || [];

type InputUsersOptions = Partial<InputOptions<string>> & {
  users?: string | string[];
};

async function inputUsers(options?: InputUsersOptions) {
  let { users } = options;
  if (Array.isArray(users)) {
    users = users.join(',');
  }
  return splitUsers(
    await lib.prompts.input({
      ...options,
      arg: users,
      message: 'Users with access to app via IAP (comma-separated)',
      validate: (value?: string) =>
        (cli.validators.notEmpty(value) === true &&
          splitUsers(value || '')
            .map(cli.validators.email)
            .reduce((valid: boolean, test) => valid && test === true, true)) ||
        'Must be comma-separated list of valid emails'
    })
  );
}

export default {
  inputApplicationTitle,
  inputSupportEmail,
  inputUsers,

  enable: async function(options?: Partial<EnableOptions>) {
    let {
      users,
      applicationTitle, // defaults to project name if undefined
      supportEmail
    } = options;
    await services.enable({ service: services.API.IdentityAwareProxyAPI });
    const proj = await projects.describe();
    let [brand] = shell.gcloud<OAuthBrand[]>(
      `iap oauth-brands list --filter=name=projects/${proj.projectNumber}/brands/${proj.projectNumber}`
    );
    // TODO allow arg-based config for brand and client?
    if (!brand) {
      applicationTitle = await inputApplicationTitle({
        applicationTitle,
        default: proj.name
      });
      supportEmail = await inputSupportEmail({ supportEmail });

      brand = shell.gcloud<OAuthBrand>(
        `iap oauth-brands create --application_title=${lib.prompts.escape(
          applicationTitle || proj.name
        )} --support_email=${supportEmail}`
      );
    }
    // FIXME probably unsafe to assume it's always the first OAuth client
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

    users = await inputUsers({ users });
    users.forEach(async (user) =>
      shell.gcloud(
        `projects add-iam-policy-binding ${projects.active.get()} --member=user:${user} --role=roles/iap.httpsResourceAccessor`
      )
    );
  }
};
