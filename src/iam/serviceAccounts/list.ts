import { gcloud } from '#shell';
import { ServiceAccount } from './ServiceAccount.js';

export async function list() {
  return await gcloud<ServiceAccount[]>('iam service-accounts list');
}
