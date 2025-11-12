import * as shell from '../shell/index.js';
import { Service } from './Service.js';

export async function list() {
  return await shell.gcloud<Service[]>('services list --available');
}
