import gcloud from '@battis/partly-gcloudy';

(async () => {
  // initialize with additional command line arguments
  const {
    values: { force }
  } = await gcloud.prepare({
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- example only!
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
      // no passed value property will result in interactive value entry
      retainVersions: 1
    });
  }
})();
