import * as shell from '../shell/index.js';
import { DeploymentConfig } from './DeploymentConfig.js';

export async function deploy() {
  return await shell.gcloud<DeploymentConfig>('app deploy', {
    error: (result) => {
      throw new Error(result.stderr);
    }
  });
}
