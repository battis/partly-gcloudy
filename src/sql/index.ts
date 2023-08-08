import MDatabases from './databases';
import MInstances from './instances';
import MTiers from './tiers';
import MUsers from './users';

class sql {
  protected constructor() {
    // ignore
  }
}

namespace sql {
  export import databases = MDatabases; // eslint-disable-line @typescript-eslint/no-unused-vars
  export import instances = MInstances; // eslint-disable-line @typescript-eslint/no-unused-vars
  export import tiers = MTiers; // eslint-disable-line @typescript-eslint/no-unused-vars
  export import users = MUsers; // eslint-disable-line @typescript-eslint/no-unused-vars
}

export { sql as default };
