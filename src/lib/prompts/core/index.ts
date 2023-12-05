import Parameters from './Parameters';

export function pad(s?: string) {
  return s ? ` ${s}` : '';
}

export function escape(s: string) {
  return `"${s.replace(/(["\n\r])/g, '\\$1')}"`;
}

export type { Parameters };
