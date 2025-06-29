import { Validators } from '@battis/qui-cli.validators';
import * as app from '../app/index.js';
import * as lib from '../lib/index.js';
import { Job } from './Job.js';
import * as shell from '../shell/index.js';

export type JobName = string;
export type Crontab = string;
export type RelativeUrl = string;

export { Job };

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
    validate: Validators.combine(validate || (() => true), Validators.notEmpty),
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
    validate: Validators.combine(validate || (() => true), Validators.cron),
    ...rest
  });
}

export async function inputRelativeUrl({
  relativeUrl,
  validate,
  ...rest
}: Partial<Parameters<typeof lib.prompts.input<RelativeUrl>>[0]> & {
  relativeUrl?: string;
} = {}) {
  return await lib.prompts.input<RelativeUrl>({
    arg: relativeUrl,
    message: 'URL to call, relative to App Engine instance root',
    validate: Validators.combine(validate || (() => true), Validators.isPath),
    ...rest
  });
}

export async function setAppEngineJob({
  name,
  cron,
  location,
  relativeUrl,
  enableAppEngineIfNecessary
}: {
  name?: string;
  cron?: string;
  location?: string;
  relativeUrl?: string;
  enableAppEngineIfNecessary?: boolean;
} = {}) {
  name = await inputJobName({ name });
  cron = await inputCrontab({ cron });
  relativeUrl = await inputRelativeUrl({ relativeUrl });
  let appEngine = await app.describe();
  if (!appEngine) {
    if (
      await lib.prompts.confirm({
        arg: enableAppEngineIfNecessary,
        message: 'App Engine is not enabled. Enable?'
      })
    ) {
      appEngine = await app.create();
      await app.deploy();
    } else {
      throw new Error('App Engine not enabled, cannot schedule job');
    }
  }
  location = location || appEngine.locationId;
  let [schedule] = await shell.gcloud<Job[]>(
    // FIXME this looks not right -- like a hold over from a specific script?
    `scheduler jobs list --filter=appEngineHttpTarget.relativeUri=/sync --location=${location}`
  );
  if (schedule) {
    await shell.gcloud(
      `scheduler jobs update app-engine ${
        schedule.name
      } --schedule=${lib.prompts.escape(cron)}`
    );
  } else {
    schedule = await shell.gcloud<Job>(
      `scheduler jobs create app-engine ${name} --schedule=${lib.prompts.escape(
        cron
      )} --relative-url=${lib.prompts.escape(relativeUrl)}`
    );
  }
  return schedule;
}
