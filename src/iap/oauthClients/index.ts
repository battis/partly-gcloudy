import cli from '@battis/qui-cli';
import lib from '../../lib';
import shell from '../../shell';
import oauthBrands from '../oauthBrands';
import TClient from './Client';

class oauthClients {
  protected constructor() {
    // ignore
  }

  public static async inputDisplayName({
    displayName,
    validate,
    ...rest
  }: Partial<
    Parameters<typeof lib.prompts.input<oauthClients.DisplayName>>[0]
  > & {
    displayName?: string;
  } = undefined) {
    return await lib.prompts.input<oauthClients.DisplayName>({
      arg: displayName,
      message: 'IAP OAuth client display name',
      validate: cli.validators.combine(validate, cli.validators.notEmpty),
      ...rest
    });
  }

  public static async describe({ name }: { name?: string } = undefined) {
    name = await this.selectName({ name, purpose: 'to describe' });
    return shell.gcloud<oauthClients.Client>(
      `iap oauth-clients describe ${name}`
    );
  }

  public static async list({ brand }: { brand?: string } = undefined) {
    brand = await oauthBrands.selectBrand({
      brand,
      purpose: 'for which to list clients'
    });
    return shell.gcloud<oauthClients.Client[]>(
      `iap oauth-clients list ${brand}`
    );
  }

  public static async selectName({
    name,
    brand,
    ...rest
  }: Partial<
    lib.prompts.select.Parameters.ValueToString<oauthClients.Client>
  > & {
    name?: string;
    brand?: string;
  } = undefined) {
    return await lib.prompts.select<oauthClients.Client>({
      arg: name,
      message: 'IAP OAuth client',
      choices: async () =>
        (
          await this.list({ brand })
        ).map((c) => ({ name: c.displayName, value: c, description: c.name })),
      transform: (c: oauthClients.Client) => c.name,
      ...rest
    });
  }

  public static selectIdentifier = this.selectName;

  public static async selectClient({
    name,
    brand,
    ...rest
  }: Partial<
    lib.prompts.select.Parameters.ValueToValue<
      oauthClients.Client,
      oauthClients.Client
    >
  > &
    Partial<Parameters<typeof this.create>[0]> & {
      name?: string;
      brand?: string;
    } = undefined) {
    return await lib.prompts.select<oauthClients.Client, oauthClients.Client>({
      arg: name,
      argTransform: async () => await this.describe({ name }),
      message: 'IAP OAuth client',
      choices: async () =>
        (
          await this.list({ brand })
        ).map((c) => ({ name: c.displayName, value: c, description: c.name })),
      transform: (c: oauthClients.Client) => c,
      create: this.create,
      ...rest
    });
  }

  public static async create({
    brand,
    displayName,
    ...rest
  }: Partial<Parameters<typeof this.inputDisplayName>[0]> & {
    brand?: string;
    displayName?: string;
  } = undefined) {
    brand = await oauthBrands.selectIdentifier({ brand, ...rest });
    displayName = await this.inputDisplayName({ displayName });
    return shell.gcloud<oauthClients.Client>(
      `iap oauth-clients create ${brand} --display_name="${displayName}"`
    );
  }
}

namespace oauthClients {
  export type DisplayName = string;
  export type Client = TClient;
}

export { oauthClients as default };
