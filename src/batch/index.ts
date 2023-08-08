import appEnginePublish from './appEnginePublish';
import createMySqlInstance from './createMySqlInstance';

class batch {
  protected constructor() {
    // ignore
  }

  public static appEnginePublish = appEnginePublish;
  public static createMySqlInstance = createMySqlInstance;
}

namespace batch { }

export { batch as default };
