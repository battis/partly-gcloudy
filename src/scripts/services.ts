import { Core } from '@qui-cli/core';
import { register } from '@qui-cli/plugin';
import * as ServiceUpdater from './ServiceUpdater.js';

await register(ServiceUpdater);
await Core.run();
