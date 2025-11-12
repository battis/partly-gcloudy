import { enableAppEngineSecretsAccess } from '../batch/enableAppEngineSecretsAccess.js';

export * from './set.js';
export * as versions from './versions/index.js';

/**
 * @deprecated Use
 *   {@link enableAppEngineSecretsAccess batch.enableAppEngineSecretsAccess()}
 */
export const enableAppEngineAccess = enableAppEngineSecretsAccess;
