import { Parameters } from '../core/Parameters.js';

export { Parameters };

export function pad(s?: string) {
  return s ? ` ${s}` : '';
}

export function escape(s: string) {
  const quoted = /\s/g.test(s);
  return `${quoted ? '"' : ''}${s.replace(/(["\n\r])/g, '\\$1')}${quoted ? '"' : ''}`;
}
