import * as shell from '#shell';

export async function update({
  serviceAccount,
  splitHealthChecks,
  sslPolicy
}: update.Options) {
  return await shell.gcloud('app update', {
    flags: {
      'service-account': serviceAccount,
      'split-health-checks': splitHealthChecks,
      'ssl-policy': sslPolicy
    }
  });
}

export namespace update {
  export type Options = {
    serviceAccount?: string;
    splitHealthChecks?: true;
    sslPolicy?: 'TLS_VERSION_1_0' | 'TLS_VERSION_1_2';
  };
}
