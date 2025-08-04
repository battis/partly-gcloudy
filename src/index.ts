import { register } from '@qui-cli/plugin';
import * as gcloud from './gcloud.js';

await register(gcloud);

export { gcloud as default };
