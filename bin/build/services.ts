import cli from '@battis/qui-cli';
import fs from 'fs';
import ora from 'ora';
import path, { dirname } from 'path';
import * as prettier from 'prettier';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_LAST_UPDATE = 'API_LAST_UPDATE';

const { values } = cli.init({
  args: {
    flags: {
      force: {
        short: 'f',
        description: `Force a rebuld of ${cli.colors.value(
          'gcloud.services.API'
        )}`
      }
    }
  },
  shell: {
    showCommands: false,
    silent: true
  }
});

const cutoff = new Date() - 24 * 60 * 60 * 1000;
const lastUpdate = new Date(
  cli.env.get({ key: API_LAST_UPDATE }) || cutoff - 1000
);
if (lastUpdate <= cutoff || values.force) {
  cli.shell.echo(`Dynamic build of ${cli.colors.value('gcloud.services.API')}`);

  let spinner = ora('Loading Google API services...');
  const services = JSON.parse(
    cli.shell.exec(
      `gcloud services list --available  --filter=name:googleapis.com --format=json --project=${process.env.PROJECT} --quiet`
    ).stdout
  );
  spinner.succeed('Google API services loaded');

  const filepath = path.join(__dirname, '../../src/services/API.ts');
  spinner = ora(`Writing ${cli.colors.url(filepath)}...`);
  fs.writeFileSync(
    filepath,
    await prettier.format(
      `export const API = {
${services
  .map(
    (service) =>
      `${service.config.title.replace(/[^a-z0-9]+/gi, '')}: {service: '${
        service.config.name
      }', validate: false },`
  )
  .join('\n')}};`,
      { filepath }
    )
  );
  spinner.succeed(`Wrote ${cli.colors.url(filepath)}`);
  cli.env.remove({ key: API_LAST_UPDATE });
  cli.env.set({
    key: API_LAST_UPDATE,
    value: new Date().toISOString(),
    replace: true
  });
} else {
  cli.shell.echo(
    `${cli.colors.value(
      'gcloud.services.API'
    )} last built ${lastUpdate}: skipping`
  );
}
