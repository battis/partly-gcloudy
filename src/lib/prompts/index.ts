import MConfirm from './confirm';
import core from './core';
import MInput from './input';
import MSelect from './select';

class prompts extends core {
  protected constructor() {
    super();
  }
}

namespace prompts {
  export import confirm = MConfirm; // eslint-disable-line @typescript-eslint/no-unused-vars
  export import input = MInput; // eslint-disable-line @typescript-eslint/no-unused-vars
  export import select = MSelect; // eslint-disable-line @typescript-eslint/no-unused-vars
}

export { prompts as default };
