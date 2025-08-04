import { Colors } from '@qui-cli/colors';
import { Core } from '@qui-cli/core';
import { Env } from '@qui-cli/env';
import { Log } from '@qui-cli/log';
import { Shell } from '@qui-cli/shell';
import fs from 'fs';
import ora from 'ora';
import path from 'path';
import * as prettier from 'prettier';
import { Service } from '../services/index.js';

const API_LAST_UPDATE = 'API_LAST_UPDATE';

Shell.configure({ showCommands: false, silent: true });
const { values } = await Core.init({
  flag: {
    force: {
      short: 'f',
      description: `Force a rebuld of ${Colors.value('gcloud.services.API')}`
    }
  }
});

const cutoff = Date.now() - 24 * 60 * 60 * 1000;
const lastUpdate = new Date(
  (await Env.get({ key: API_LAST_UPDATE })) || cutoff - 1000
).getTime();
if (lastUpdate <= cutoff || values.force) {
  Log.info(`Dynamic build of ${Colors.value('gcloud.services.API')}`);

  let spinner = ora('Loading Google API services...');
  const services = JSON.parse(
    Shell.exec(
      `gcloud services list --available  --filter=name:googleapis.com --format=json --project=${process.env.PROJECT} --quiet`
    ).stdout
  );
  spinner.succeed('Google API services loaded');

  const filepath = path.join(import.meta.dirname, '../../src/services/API.ts');
  spinner = ora(`Writing ${Colors.url(filepath)}...`);
  fs.writeFileSync(
    filepath,
    await prettier.format(
      `export const API = {
${services
  .map(
    (service: Service) =>
      `${service.config.title.replace(/[^a-z0-9]+/gi, '')}: {service: '${
        service.config.name
      }', validate: false },`
  )
  .join('\n')}};`,
      { filepath }
    )
  );
  spinner.succeed(`Wrote ${Colors.url(filepath)}`);
  Env.remove({ key: API_LAST_UPDATE });
  Env.set({
    key: API_LAST_UPDATE,
    value: new Date().toISOString()
  });
} else {
  Log.info(
    `${Colors.value('gcloud.services.API')} last built ${new Date(lastUpdate)}: skipping`
  );
}
