import cli from '@battis/qui-cli';
import fs from 'fs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

cli.init({ shell: { silent: true, showCommands: false } });
let spinner = cli.spinner('Loading Google API services...');
const services = JSON.parse(
  cli.shell.exec(
    `gcloud services list --available  --filter=name:googleapis.com --format=json --project=${process.env.PROJECT} --quiet`
  ).stdout
);
spinner.succeed('Google API services loaded');

spinner = cli.spinner('Writing src/services/API.ts...');
fs.writeFileSync(
  path.join(__dirname, '../../src/services/API.ts'),
  `export const API = {
${services
  .map(
    (service) =>
      `    ${service.config.title.replace(/[^a-z0-9]+/gi, '')}: '${
        service.config.name
      }',`
  )
  .join('\n')}
};

export default API;`
);
spinner.succeed('Wrote src/services/API.ts');
