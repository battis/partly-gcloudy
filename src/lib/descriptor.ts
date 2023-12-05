interface Descriptor {
  [key: string]: any;
}

namespace Descriptor {
  /**
   * "A Descriptor is not a Choice"
   *
   * @see lib.prompts.select.Choice
   */
  export function isDescriptor(value: object): value is Descriptor {
    const choice = ['name', 'description', 'value', 'disabled'];
    const keys = Object.keys(value);
    return (
      keys.every((k) => typeof k === 'string') &&
      (choice.length != keys.length || !choice.every((c) => keys.includes(c)))
    );
  }
}

export default Descriptor;
