import { gcloud } from '#shell';
import { Account } from './Account.js';

export async function list() {
  return await gcloud<Account[]>('billing accounts list --filter=open=true');
}
