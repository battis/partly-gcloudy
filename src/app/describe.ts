import * as lib from '#lib';
import * as shell from '#shell';
import { AppEngine } from './AppEngine.js';

export async function describe() {
  return await shell.gcloud<AppEngine, lib.Undefined.Value>('app describe', {
    error: lib.Undefined.callback
  });
}
