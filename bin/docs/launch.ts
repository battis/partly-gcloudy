import { Core } from '@battis/qui-cli.core';
import { Root } from '@battis/qui-cli.root';
import path from 'node:path';
import open from 'open';

Core.init();
open(path.join(Root.path(), './docs/docs/index.html'));
