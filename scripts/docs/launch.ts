import { Core } from '@qui-cli/core';
import { Root } from '@qui-cli/root';
import path from 'node:path';
import open from 'open';

Core.init();
open(path.join(Root.path(), './docs/docs/index.html'));
