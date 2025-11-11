import * as shell from '../../shell/index.js';
import { Region } from './Region.js';

export { Region };

export async function list() {
  return await shell.gcloud<Region[]>('app regions list');
}
