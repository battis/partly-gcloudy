import * as services from '#services';
import * as shell from '#shell';
import { AppEngine } from './AppEngine.js';
import { describe } from './describe.js';
import * as regions from './regions/index.js';

/**
 * There can only be one AppEngine instance per project, so if one already
 * exists it will be returned rather than created
 */
export async function create({ region }: create.Options = {}) {
  await services.enable(services.API.AppEngineAdminAPI);
  let instance = await describe();
  if (!instance) {
    instance = await shell.gcloud<AppEngine>('app create', {
      flags: {
        region: await regions.select({
          region,
          purpose: 'to create App Engine instance'
        })
      }
    });
  }
  return instance;
}

export namespace create {
  export type Options = { region?: string };
}
