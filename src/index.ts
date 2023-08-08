/* eslint-disable @typescript-eslint/no-unused-vars */

import MApp from './app';
import MBatch from './batch';
import MBilling from './billing';
import core from './core';
import MIam from './iam';
import MIap from './iap';
import MLib from './lib';
import MProjects from './projects';
import MScheduler from './scheduler';
import MSecrets from './secrets';
import MServices from './services';
import MSql from './sql';

class gcloud extends core {
  protected constructor() {
    super();
    //ignore
  }
}

namespace gcloud {
  // library
  export import batch = MBatch;
  export import lib = MLib;

  // endpoints
  export import app = MApp;
  export import billing = MBilling;
  export import iam = MIam;
  export import iap = MIap;
  export import projects = MProjects;
  export import scheduler = MScheduler;
  export import secrets = MSecrets;
  export import services = MServices;
  export import sql = MSql;

  // endpoint aliases
  export import identityAndAccessManagement = MIam;
  export import identityAwareProxy = MIap;
  export import secretManager = MSecrets;
}

export { gcloud as default };
