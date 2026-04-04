import * as lib from '#lib';
import { gcloud } from '#shell';
import { Validators } from '@qui-cli/validators';
import * as oauthBrands from '../oauthBrands/index.js';
import { Client } from './Client.js';

type DisplayName = string;

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

export async function create({
  brand,
  displayName,
  ...rest
}: Partial<Parameters<typeof inputDisplayName>[0]> & {
  brand?: string;
  displayName?: string;
} = {}) {
  brand = await oauthBrands.select({ brand, ...rest });
  displayName = await inputDisplayName({ displayName, ...rest });
  return await gcloud<Client>(
    `iap oauth-clients create ${brand} --display_name="${displayName}"`
  );
}
