import * as shell from '#shell';
import { DeploymentConfig } from './DeploymentConfig.js';

export async function deploy() {
  return await shell.gcloud<DeploymentConfig>('app deploy', {
    error: (result) => {
      throw new Error(result.stderr);
    }
  });
}
