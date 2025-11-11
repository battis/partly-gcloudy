import * as shell from '../shell/index.js';

export async function logs() {
  // TODO app logs should be configurable
  return await shell.gcloud('app logs tail -s default', {
    overrideBaseFlags: true,
    flags: { format: 'text' }
  });
}
