import { Core } from '@qui-cli/core';
import { Root } from '@qui-cli/root';
import { Shell } from '@qui-cli/shell';
import fs from 'node:fs';
import path from 'node:path';

Core.init();

const pkg = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url)).toString()
);
const tag = `v${pkg.version}-docs`;

Shell.cd(path.join(Root.path(), './docs'));
Shell.exec('git add -A .');
Shell.exec(`git commit -m "Update documentation for v${pkg.version}"`);
Shell.exec(`git tag ${tag}`);
Shell.exec(`git push origin ${tag}`);
