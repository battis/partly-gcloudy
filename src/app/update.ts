import * as shell from '../shell/index.js';

type Options = {
  serviceAccount?: string;
  splitHealthChecks?: boolean;
  sslPolicy?: 'TLS_VERSION_1_0' | 'TLS_VERSION_1_2';
};

export async function update({
  serviceAccount,
  splitHealthChecks,
  sslPolicy
}: Options) {
  return await shell.gcloud(
    `app update${
      serviceAccount !== undefined
        ? ` --service-account="${serviceAccount}"`
        : ''
    }${
      splitHealthChecks !== undefined
        ? splitHealthChecks
          ? ' --split-health-checks'
          : ' --no-split-health-checks'
        : ''
    }${sslPolicy !== undefined ? ` --ssl-policy=${sslPolicy}` : ''}`
  );
}
