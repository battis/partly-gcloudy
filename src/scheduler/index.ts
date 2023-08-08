import cli from '@battis/qui-cli';
import app from '../app';
import lib from '../lib';
import shell from '../shell';
import TJob from './Job';

class scheduler {
  public constructor() {
    // ignore
  }

  public static async inputJobName({
    name,
    validate,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input<scheduler.JobName>>[0]> & {
    name?: string;
  }) {
    return lib.prompts.input<scheduler.JobName>({
      arg: name,
      message: 'Scheduled job name',
      validate: cli.validators.combine(validate, cli.validators.notEmpty),
      ...rest
    });
  }

  public static async inputCrontab({
    cron,
    validate,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input<scheduler.Crontab>>[0]> & {
    cron?: string;
  }) {
    return await lib.prompts.input<scheduler.Crontab>({
      arg: cron,
      message: 'Crontab for scheduled job',
      validate: cli.validators.combine(validate, cli.validators.cron),
      ...rest
    });
  }

  public static async inputRelativeUrl({
    relativeUrl,
    validate,
    ...rest
  }: Partial<Parameters<typeof lib.prompts.input<scheduler.RelativeUrl>>[0]> & {
    relativeUrl?: string;
  } = undefined) {
    return await lib.prompts.input<scheduler.RelativeUrl>({
      arg: relativeUrl,
      message: 'URL to call, relative to App Engine instance root',
      validate: cli.validators.combine(validate, cli.validators.isPath),
      ...rest
    });
  }

  public static async setAppEngineJob({
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
    name = await this.inputJobName({ name });
    cron = await this.inputCrontab({ cron });
    relativeUrl = await this.inputRelativeUrl({ relativeUrl });
    location = location || (await app.describe()).locationId;
    let [schedule] = shell.gcloud<scheduler.Job[]>(
      // FIXME this looks not right -- like a hold over from a specific script?
      `scheduler jobs list --filter=appEngineHttpTarget.relativeUri=/sync --location=${location}`
    );
    if (schedule) {
      shell.gcloud(
        `scheduler jobs update app-engine ${schedule.name
        } --schedule=${lib.prompts.escape(cron)}`
      );
    } else {
      schedule = shell.gcloud<scheduler.Job>(
        `scheduler jobs create app-engine ${name} --schedule=${lib.prompts.escape(
          cron
        )} --relative-url=${lib.prompts.escape(relativeUrl)}`
      );
    }
    return schedule;
  }
}

namespace scheduler {
  export type JobName = string;
  export type Crontab = string;
  export type RelativeUrl = string;
  export type Job = TJob;
}

export { scheduler as default };
