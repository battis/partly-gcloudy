import cli from '@battis/qui-cli';
import lib from '../../lib';
import projects from '../../projects';
import shell from '../../shell';
import TBrand from './Brand';

class oauthBrands {
  protected constructor() {
    // ignore
  }

  public static active = new lib.Active<oauthBrands.Brand>(undefined);

  public static async inputApplicationTitle({
    applicationTitle,
    validate,
    ...rest
  }: Partial<
    Parameters<typeof lib.prompts.input<oauthBrands.ApplicationTitle>>[0]
  > & {
    applicationTitle?: string;
  } = undefined) {
    return await lib.prompts.input({
      arg: applicationTitle,
      message: 'Application title for OAuth consent dialog',
      validate: cli.validators.combine(validate, cli.validators.notEmpty),
      ...rest
    });
  }

  public static async inputSupportEmail({
    supportEmail,
    validate,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input<lib.Email>>[0]> & {
    supportEmail?: string;
  } = undefined) {
    return await lib.prompts.input({
      arg: supportEmail,
      message: 'Support email from OAuth consent dialog',
      validate: cli.validators.combine(validate, cli.validators.email),
      default: supportEmail,
      ...rest
    });
  }

  public static async create({
    applicationTitle,
    supportEmail,
    project,
    activate = true
  }: {
    applicationTitle?: string;
    supportEmail?: lib.Email;
    project?: projects.Project;
    activate?: boolean;
  } = undefined) {
    project = await projects.selectProject({ project });

    applicationTitle = await this.inputApplicationTitle({
      applicationTitle,
      default: project.name
    });
    supportEmail = await this.inputSupportEmail({ supportEmail });

    const brand = shell.gcloud<oauthBrands.Brand>(
      `iap oauth-brands create --application_title=${lib.prompts.escape(
        applicationTitle
      )} --support_email=${supportEmail}`
    );
    if (activate) this.active.activate(brand);
    return brand;
  }

  public static async list({
    projectNumber
  }: { projectNumber?: number | string } = undefined) {
    projectNumber = await projects.selectProjectNumber({ projectNumber });
    return shell.gcloud<oauthBrands.Brand[]>(
      `iap oauth-brands list --filter=name=projects/${projectNumber}/brands/${projectNumber}`
    );
  }

  public static async selectBrand({
    brand,
    activate,
    activateIfCreated = true,
    ...rest
  }: Partial<lib.prompts.select.Parameters.ValueToString<oauthBrands.Brand>> &
    Partial<Parameters<typeof this.create>>[0] & {
      brand?: string;
      activate?: boolean;
    } = undefined) {
    return await lib.prompts.select<oauthBrands.Brand>({
      arg: brand,
      message: 'IAP OAuth brand',
      choices: async () =>
        (
          await this.list()
        ).map((b) => ({
          name: b.applicationTitle,
          value: b,
          desription: b.name
        })),
      transform: (b: oauthBrands.Brand) => b.name,
      activate: activate && this.active,
      create: this.create,
      activateIfCreated,
      ...rest
    });
  }

  public static selectIdentifier = this.selectBrand;
}

namespace oauthBrands {
  export type ApplicationTitle = string;
  export type Brand = TBrand;
}

export { oauthBrands as default };
