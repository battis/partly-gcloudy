import * as shell from '../../shell/index.js';
import { ServiceAccount } from './ServiceAccount.js';

export async function list() {
  return await shell.gcloud<ServiceAccount[]>('iam service-accounts list');
}
