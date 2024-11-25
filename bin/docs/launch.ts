import cli from '@battis/qui-cli';
import path from 'node:path';
import open from 'open';

cli.init();
open(path.join(cli.appRoot(), './docs/docs/index.html'));
