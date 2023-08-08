import MAccounts from './accounts';
import MProjects from './projects';

class billing {
  protected constructor() {
    // ignore
  }
}

namespace billing {
  export import accounts = MAccounts; // eslint-disable-line @typescript-eslint/no-unused-vars
  export import projects = MProjects; // eslint-disable-line @typescript-eslint/no-unused-vars
}

export { billing as default };
