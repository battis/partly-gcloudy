import gcloud from '@battis/partly-gcloudy';
import { Core } from '@battis/qui-cli.core';
import { Root } from '@battis/qui-cli.root';
import path from 'node:path';

(async () => {
  // configure the script root/CWD to be the root of the package (in a monorepo)
  Root.configure({ path: path.dirname(import.meta.dirname) });
  const {
    values: { force }
  } = await Core.init({
    flag: {
      force: {
        short: 'f',
        default: false
      }
    }
  });

  // determine project state before publishing/deploying
  const configure = force || !process.env.PROJECT;

  // publish or deploy the app (depending on its current state)
  const { project, app, deployment } =
    await gcloud.batch.appEngineDeployAndCleanup({
      retainVersions: 2
    });

  // one-time configuration (e.g. enabling services, creating secrets, etc.)
  if (configure) {
    await gcloud.services.enable(gcloud.services.API.CloudFirestoreAPI);
    await gcloud.services.enable(
      gcloud.services.API.CloudMemorystoreforMemcachedAPI
    );
  }
})();
