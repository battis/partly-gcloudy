import { register } from '@battis/qui-cli.plugin';
import * as core from './core.js';
import * as plugin from './plugin.js';

const gcloud = { ...core, ...plugin };
await register(gcloud);

export { gcloud as default };
