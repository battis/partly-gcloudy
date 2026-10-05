import { gcloud } from '#shell';
import * as oauthBrands from '../oauthBrands/index.js';
import { Client } from './Client.js';
import * as lib from '#lib';

type Options = {
  brand?: string;
} & lib.PartialOptions<typeof oauthBrands.select>;

export async function list({ brand, ...options }: Options = {}) {
  brand = await oauthBrands.select({
    brand,
    purpose: 'for which to list clients',
    ...options
  });
  return await gcloud<Client[]>(`iap oauth-clients list ${brand}`);
}
