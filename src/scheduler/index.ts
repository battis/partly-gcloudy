import cli from '@battis/qui-cli';
import * as app from '../app';
import * as lib from '../lib';
import * as shell from '../shell';
import Job from './Job';

export async function inputJobName({
  name,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<JobName>>[0]> & {
  name?: string;
}) {
  return lib.prompts.input<JobName>({
    arg: name,
    message: 'Scheduled job name',
    validate: cli.validators.combine(validate, cli.validators.notEmpty),
    ...rest
  });
}

export async function inputCrontab({
  cron,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<Crontab>>[0]> & {
  cron?: string;
}) {
  return await lib.prompts.input<Crontab>({
    arg: cron,
    message: 'Crontab for scheduled job',
    validate: cli.validators.combine(validate, cli.validators.cron),
    ...rest
  });
}

export async function inputRelativeUrl({
  relativeUrl,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<RelativeUrl>>[0]> & {
  relativeUrl?: string;
} = undefined) {
  return await lib.prompts.input<RelativeUrl>({
    arg: relativeUrl,
    message: 'URL to call, relative to App Engine instance root',
    validate: cli.validators.combine(validate, cli.validators.isPath),
    ...rest
  });
}

export async function setAppEngineJob({
  name,
  cron,
  location,
  relativeUrl
}: {
  name?: string;
  cron?: string;
  location?: string;
  relativeUrl?: string;
} = undefined) {
  name = await inputJobName({ name });
  cron = await inputCrontab({ cron });
  relativeUrl = await inputRelativeUrl({ relativeUrl });
  location = location || (await app.describe()).locationId;
  let [schedule] = shell.gcloud<Job[]>(
    // FIXME this looks not right -- like a hold over from a specific script?
    `scheduler jobs list --filter=appEngineHttpTarget.relativeUri=/sync --location=${location}`
  );
  if (schedule) {
    shell.gcloud(
      `scheduler jobs update app-engine ${
        schedule.name
      } --schedule=${lib.prompts.escape(cron)}`
    );
  } else {
    schedule = shell.gcloud<Job>(
      `scheduler jobs create app-engine ${name} --schedule=${lib.prompts.escape(
        cron
      )} --relative-url=${lib.prompts.escape(relativeUrl)}`
    );
  }
  return schedule;
}
export type JobName = string;
export type Crontab = string;
export type RelativeUrl = string;

export { type Job };
