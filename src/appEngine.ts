import cli from '@battis/cli';
import fs from 'node:fs';
import invoke from './invoke';
import * as project from './project';

type CreateOptions = {
  region: string;
  writeDotEnvFile: boolean;
};

type Instance = {
  authDomain: string;
  codeBucket: string;
  databaseType: string;
  defaultBucket: string;
  defaultHostname: string;
  featureSettings: {
    splitHealthChecks: boolean;
    useContainerOptimizedOs: true;
  };
  gcrDomain: string;
  iap: {
    enable: boolean;
    oauth2ClientId: string;
    oauth2ClientSecretSha256: string;
  };
  id: string;
  locationid: string;
  name: string;
  serviceAccount: string;
  servingStatus: string;
};

export async function describe() {
  return await invoke<Instance>('app describe');
}

export async function create({
  region,
  writeDotEnvFile = true
}: Partial<CreateOptions>) {
  await invoke('services enable appengine.googleapis.com');
  let instance = await describe();
  if (instance == null) {
    const response = await invoke(`app regions list`);
    let choices;
    if (Array.isArray(response)) {
      choices = response.map((region) => ({
        value: region.region
      }));
    } else {
      throw new Error(`Unexpected response: ${response}`);
    }
    region =
      region ||
      (await cli.io.prompts.select({
        message: 'Google Cloud region in which to create App Engine instance',
        choices
      }));
    await invoke(`app create --region=${region}`);
    instance = await describe();
  }

  if (writeDotEnvFile) {
    const url = `https://${instance.defaultHostname}`;
    fs.writeFileSync(
      '.env',
      `PROJECT=${project.getId()}
URL=${url}`
    );
  }

  return instance;
}
