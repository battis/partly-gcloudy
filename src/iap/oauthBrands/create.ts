import { Validators } from '@qui-cli/validators';
import * as lib from '../../lib/index.js';
import * as projects from '../../projects/index.js';
import * as shell from '../../shell/index.js';
import { Brand } from './Brand.js';
import { active } from './active.js';

type ApplicationTitle = string;

export async function inputApplicationTitle({
  applicationTitle,
  validate,
  ...rest
}: {
  applicationTitle?: string;
} & Partial<Parameters<typeof lib.prompts.input<ApplicationTitle>>[0]> = {}) {
  return await lib.prompts.input({
    arg: applicationTitle,
    message: 'Application title for OAuth consent dialog',
    validate: Validators.combine(validate || (() => true), Validators.notEmpty),
    ...rest
  });
}

export async function inputSupportEmail({
  supportEmail,
  validate,
  ...rest
}: {
  supportEmail?: lib.Email;
} & Partial<Parameters<typeof lib.prompts.input<lib.Email>>[0]> = {}) {
  return await lib.prompts.input({
    arg: supportEmail,
    message: 'Support email from OAuth consent dialog',
    validate: Validators.combine(validate || (() => true), Validators.email()),
    default: supportEmail,
    ...rest
  });
}

export async function create({
  applicationTitle,
  supportEmail,
  project,
  activate = true
}: {
  applicationTitle?: string;
  supportEmail?: lib.Email;
  project?: projects.Project;
  activate?: boolean;
} = {}) {
  project = await projects.factory({ project });

  applicationTitle = await inputApplicationTitle({
    applicationTitle,
    default: project?.name
  });
  supportEmail = await inputSupportEmail({ supportEmail });

  const brand = await shell.gcloud<Brand>(
    `iap oauth-brands create --application_title=${lib.prompts.escape(
      applicationTitle
    )} --support_email=${supportEmail}`
  );
  if (activate) active.activate(brand);
  return brand;
}
