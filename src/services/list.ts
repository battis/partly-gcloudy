import { gcloud } from '#shell';
import { Service } from './Service.js';

export async function list() {
  return await gcloud<Service[]>('services list --available');
}
