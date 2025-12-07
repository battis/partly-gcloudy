import * as app from './app/index.js';
import * as secrets from './secrets/index.js';

export * as app from './app/index.js';
export * as iam from './iam/index.js';
export * as secrets from './secrets/index.js';

/** @deprecated Use {@link app.initialize()} */
export const appEnginePublish = app.initialize;

/** @deprecated Use {@link app.deploy()} */
export const appEngineDeployAndCleanup = app.deploy;

/** @deprecated Use {@link app.initialize()} */
export const enableAppEngineSecretsAccess = app.enableSecretsAccess;

/** @deprecated Use {@link secrets.set()} */
export const secretsSetAndCleanUp = secrets.set;
