import * as lib from '#lib';
import * as shell from '#shell';
import { Region } from './Region.js';

export async function describe({ region }: describe.Options) {
  return (
    await shell.gcloud<Region[], lib.Undefined.Value>('app regions list', {
      flags: { region },
      error: lib.Undefined.callback
    })
  )?.shift();
}

export namespace describe {
  export type Options = { region: string };
}
