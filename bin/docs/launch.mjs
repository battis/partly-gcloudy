#!/usr/bin/env node
import appRootPath from 'app-root-path';
import open from 'open';
import path from 'path';
open(path.join(appRootPath.toString(), './docs/docs/index.html'));
