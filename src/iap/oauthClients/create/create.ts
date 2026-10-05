import { gcloud } from '#shell';
import * as oauthBrands from '../../oauthBrands/index.js';
import { Client } from '../Client.js';
import { inputDisplayName } from './inputDisplayName.js';
import * as lib from '#lib';

type Options = {
  brand?: string;
  displayName?: string;
} & lib.PartialOptions<typeof inputDisplayName>;

export async function create({ brand, displayName, ...rest }: Options = {}) {
  brand = await oauthBrands.select({ brand, ...rest });
  displayName = await inputDisplayName({ displayName, ...rest });
  return await gcloud<Client>(`iap oauth-clients create ${brand}`, {
    flags: { display_name: displayName }
  });
}
