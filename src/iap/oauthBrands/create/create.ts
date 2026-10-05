import * as lib from '#lib';
import * as projects from '#projects';
import { gcloud } from '#shell';
import { active } from '../active.js';
import { Brand } from '../Brand.js';
import { inputApplicationTitle } from './inputApplicationTitle.js';
import { inputSupportEmail } from './inputSupportEmail.js';

type Options = {
  applicationTitle?: string;
  supportEmail?: lib.Email;
  purpose?: string;
  project?: projects.Project;
  activate?: boolean;
};

export async function create({
  applicationTitle,
  supportEmail,
  project,
  activate = true,
  ...options
}: Options = {}) {
  project = await projects.factory({ project });

  applicationTitle = await inputApplicationTitle({
    applicationTitle,
    default: project?.name,
    ...options
  });
  supportEmail = await inputSupportEmail({ supportEmail, ...options });

  const brand = await gcloud<Brand>('iap oauth-brands create', {
    flags: {
      application_title: applicationTitle,
      support_email: supportEmail
    }
  });
  if (activate) active.activate(brand);
  return brand;
}
