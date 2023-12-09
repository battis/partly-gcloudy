import cli from '@battis/qui-cli';
import fs from 'fs';
import path from 'path';
import * as url from 'url';
import * as prettier from 'prettier';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

cli.shell.echo(`Dynamic build of ${cli.colors.value('gcloud.services.API')}`);

cli.init({ shell: { silent: true, showCommands: false } });
let spinner = cli.spinner('Loading Google API services...');
const services = JSON.parse(
  cli.shell.exec(
    `gcloud services list --available  --filter=name:googleapis.com --format=json --project=${process.env.PROJECT} --quiet`
  ).stdout
);
spinner.succeed('Google API services loaded');

const filepath = path.join(__dirname, '../../src/services/API.ts');
spinner = cli.spinner(`Writing ${cli.colors.url(filepath)}...`);
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
  .join('\n')}}; export default API;`,
    { filepath }
  )
);
spinner.succeed(`Wrote ${cli.colors.url(filepath)}`);
