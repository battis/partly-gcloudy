import gcloud from '@battis/partly-gcloudy';
import CLI from '@battis/qui-cli';
import path from 'node:path';

(async () => {
  // configure the script root/CWD to be the root of the package (in a monorepo)
  CLI.root.configure({ path: path.dirname(import.meta.dirname) });

  // initialize with command line arguments
  const {
    values: { force }
  } = await CLI.init({
    flag: {
      force: {
        short: 'f',
        description: `Force the initial setup wizard to run, even if not needed`,
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
    await gcloud.secrets.enableAppEngineAccess();
    await gcloud.batch.secretsSetAndCleanUp({
      key: 'my-secret',
      value: 's00per53kr37',
      retainVersions: 1
    });
  }
})();
