import Active from './Active';
import TDescriptor from './Descriptor';
import TEmail from './Email';
import MGenerate from './generate';
import MPrompts from './prompts';
import validators from './validators';

class lib {
  protected constructor() {
    // ignore
  }

  public static Active = Active;

  public static validators = validators;
}

namespace lib {
  export type Descriptor = TDescriptor;
  export type Email = TEmail;
  export import prompts = MPrompts; // eslint-disable-line @typescript-eslint/no-unused-vars
  export import generate = MGenerate; // eslint-disable-line @typescript-eslint/no-unused-vars
}

export { lib as default };
