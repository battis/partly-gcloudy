import cli from '@battis/qui-cli';
import fs from 'node:fs';
import path from 'node:path';

cli.init();

const pkg = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url)).toString()
);
const tag = `v${pkg.version}-docs`;

cli.shell.cd(path.join(cli.appRoot(), './docs'));
cli.shell.exec('git add -A .');
cli.shell.exec(`git commit -m "Update documentation for v${pkg.version}"`);
cli.shell.exec(`git tag ${tag}`);
cli.shell.exec(`git push origin ${tag}`);
