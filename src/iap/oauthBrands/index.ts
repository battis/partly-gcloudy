import { Validators } from '@battis/qui-cli.validators';
import * as lib from '../../lib/index.js';
import * as projects from '../../projects/index.js';
import * as shell from '../../shell/index.js';
import { Brand } from './Brand.js';

export const active = new lib.Active<Brand>(undefined);

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
  project = await projects.selectProject({ project });

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

export async function describe({ name }: { name: string }) {
  return shell.gcloud<Brand, lib.Undefined.Value>(
    `iap oauth-brands describe ${name}`,
    { error: lib.Undefined.callback }
  );
}

export async function list({
  project,
  projectNumber
}: { project?: projects.Project; projectNumber?: number | string } = {}) {
  projectNumber =
    project?.projectNumber ||
    projectNumber ||
    (await projects.selectProjectNumber({ projectNumber }));
  return await shell.gcloud<Brand[]>(
    `iap oauth-brands list --filter=name=projects/${projectNumber}/brands/${projectNumber}`
  );
}

export async function selectBrand({
  brand,
  activate,
  activateIfCreated = true,
  ...rest
}: {
  brand?: string;
  activate?: boolean;
} & Partial<lib.prompts.select.Parameters<Brand>> &
  Partial<Parameters<typeof create>[0]> &
  Partial<Parameters<typeof list>[0]> = {}) {
  return await lib.prompts.select<Brand>({
    arg: brand,
    argTransform: async (name: string) => await describe({ name }),
    message: 'IAP OAuth brand',
    choices: async () =>
      (await list({ ...rest })).map((b: Brand) => ({
        name: b.applicationTitle,
        value: b,
        desription: b.name
      })),
    transform: (b: Brand) => b.name,
    active: activate ? active : undefined,
    create: async (applicationTitle?: string) =>
      await create({ applicationTitle, activate, ...rest }),
    activateIfCreated,
    ...rest
  });
}

export const selectIdentifier = selectBrand;

export type ApplicationTitle = string;
export { type Brand };
