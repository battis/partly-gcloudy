import * as shell from '#shell';
import { Region } from './Region.js';

export async function list() {
  return await shell.gcloud<Region[]>('app regions list');
}
