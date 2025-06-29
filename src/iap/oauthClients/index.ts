import { Validators } from '@battis/qui-cli.validators';
import * as lib from '../../lib/index.js';
import * as shell from '../../shell/index.js';
import * as oauthBrands from '../oauthBrands/index.js';
import { Client } from './Client.js';

export type DisplayName = string;
export { type Client };

export async function inputDisplayName({
  displayName,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<DisplayName>>[0]> & {
  displayName?: string;
} = {}) {
  return await lib.prompts.input<DisplayName>({
    arg: displayName,
    message: 'IAP OAuth client display name',
    validate: Validators.combine(validate || (() => true), Validators.notEmpty),
    ...rest
  });
}

export async function describe({ name }: { name: string }) {
  return await shell.gcloud<Client, lib.Undefined.Value>(
    `iap oauth-clients describe ${name}`,
    { error: lib.Undefined.callback }
  );
}

export async function list({
  brand,
  ...rest
}: { brand?: string } & Partial<
  Parameters<typeof oauthBrands.selectBrand>
>[0] = {}) {
  brand = await oauthBrands.selectBrand({
    brand,
    purpose: 'for which to list clients',
    ...rest
  });
  return await shell.gcloud<Client[]>(`iap oauth-clients list ${brand}`);
}

export async function selectName({
  name,
  brand,
  ...rest
}: Partial<lib.prompts.select.Parameters<Client>> &
  Partial<Parameters<typeof list>>[0] & {
    name?: string;
    brand?: string;
  } = {}) {
  return await lib.prompts.select<Client>({
    arg: name,
    argTransform: async (name: string) => await describe({ name }),
    message: 'IAP OAuth client',
    choices: async () =>
      (await list({ brand, ...rest })).map((c) => ({
        name: c.displayName,
        value: c,
        description: c.name
      })),
    transform: (c: Client) => c.name,
    ...rest
  });
}

export const selectIdentifier = selectName;

export async function selectClient({
  name,
  brand,
  ...rest
}: {
  name?: string;
  brand?: string;
} & Partial<lib.prompts.select.Parameters<Client, Client>> &
  Partial<Parameters<typeof create>[0]> &
  Partial<Parameters<typeof list>[0]> = {}) {
  return await lib.prompts.select<Client, Client>({
    arg: name,
    argTransform: async (name: string) => await describe({ name }),
    message: 'IAP OAuth client',
    choices: async () =>
      (await list({ brand, ...rest })).map((c) => ({
        name: c.displayName,
        value: c,
        description: c.name
      })),
    create: async (displayName?: string) =>
      await create({ displayName, ...rest }),
    ...rest
  });
}

export async function create({
  brand,
  displayName,
  ...rest
}: Partial<Parameters<typeof inputDisplayName>[0]> & {
  brand?: string;
  displayName?: string;
} = {}) {
  brand = await oauthBrands.selectIdentifier({ brand, ...rest });
  displayName = await inputDisplayName({ displayName, ...rest });
  return await shell.gcloud<Client>(
    `iap oauth-clients create ${brand} --display_name="${displayName}"`
  );
}
