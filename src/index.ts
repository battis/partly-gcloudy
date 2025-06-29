import { register } from '@battis/qui-cli.plugin';
import * as gcloud from './gcloud.js';

await register(gcloud);

export { gcloud as default };
