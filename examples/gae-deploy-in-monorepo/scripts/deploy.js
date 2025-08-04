import gcloud from '@battis/partly-gcloudy';
import { Root } from '@qui-cli/root';
import path from 'node:path';

(async () => {
  // configure the script root/CWD to be the root of the package (in a monorepo)
  Root.configure({ path: path.dirname(import.meta.dirname) });

  // continue as normal
  await gcloud.prepare();
  await gcloud.batch.appEngineDeployAndCleanup({ retainVersions: 2 });
})();
