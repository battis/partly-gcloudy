export function filePathFrom(file?: true | string) {
  if (file && typeof file === 'string') {
    return { file };
  }
  return {};
}
