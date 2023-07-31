export type PromptConfig = {
  arg: string | boolean;
  purpose?: string;
};

export const pad = (s?: string) => (s ? ` ${s}` : '');

export const escape = (s: string) => `"${s.replace(/(["\n\r])/g, '\\$1')}"`;
