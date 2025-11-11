import * as lib from '../../lib/index.js';
import * as shell from '../../shell/index.js';
import { Region } from './Region.js';

export async function describe({ region }: { region: string }) {
  return (
    await shell.gcloud<Region[], lib.Undefined.Value>(
      `app regions list --filter=region=${region}`,
      { error: lib.Undefined.callback }
    )
  )?.shift();
}
