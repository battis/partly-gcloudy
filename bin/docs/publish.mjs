#!/usr/bin/env node
import appRootPath from 'app-root-path';
import fs from 'fs';
import path from 'path';
import shell from 'shelljs';

const pkg = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url))
);
const tag = `v${pkg.version}-docs`;

shell.cd(path.join(appRootPath.toString(), './docs'));
shell.exec('git add -A .');
shell.exec(`git commit -m "Update documentation for v${pkg.version}"`);
shell.exec(`git tag ${tag}`);
shell.exec(`git push origin ${tag}`);
