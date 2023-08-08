import TParameters from './Parameters';

class core {
  protected constructor() {
    // ignore
  }

  public static pad = (s?: string) => (s ? ` ${s}` : '');

  public static escape = (s: string) => `"${s.replace(/(["\n\r])/g, '\\$1')}"`;
}

namespace core {
  export type Parameters = TParameters;
}

export { core as default };
