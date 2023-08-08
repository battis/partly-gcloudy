import cli from '@battis/qui-cli';

export default {
  exclude:
    <T = string>({
      exclude,
      property
    }: T extends string
      ? { exclude: string; property?: undefined }
      : { exclude: T; property: string }) =>
      (value?: string) =>
        (value &&
          (property ? value !== exclude[property] : property !== exclude)) ||
        `Cannot reuse ${cli.colors.value(value)}`
};
