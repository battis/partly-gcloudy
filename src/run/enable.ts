import * as services from '../services/index.js';

let enabled = false;

export async function isEnabled() {
  if (!enabled) {
    await services.enable(services.API.CloudRunAdminAPI);
    enabled = true;
  }
  return enabled;
}
