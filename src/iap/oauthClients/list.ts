import * as shell from '../../shell/index.js';
import * as oauthBrands from '../oauthBrands/index.js';
import { Client } from './Client.js';

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
