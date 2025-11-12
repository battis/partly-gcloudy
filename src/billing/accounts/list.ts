import * as shell from '../../shell/index.js';
import { Account } from './Account.js';

export async function list() {
  return await shell.gcloud<Account[]>(
    'billing accounts list --filter=open=true'
  );
}
