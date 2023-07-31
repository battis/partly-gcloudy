import cli from '@battis/qui-cli';
import app from './app';
import lib from './lib';
import { InputOptions } from './lib/prompts';
import shell from './shell';

type AppEngineHttpTarget = {
  appEngineRouting: {
    host: string;
    service: string;
  };
  headers: {
    'User-Agent': string;
  };
  httpMethod: 'GET' | 'POST';
  relativeUri: string;
};

type Job = {
  appEngineHttpTarget?: AppEngineHttpTarget;
  description: string;
  lastAttemptTime: string;
  name: string;
  retryConfig: {
    maxBackoffDuration: string;
    maxDoublings: number;
    maxRetryDuration: string;
    minBackoffDuration: string;
  };
  schedule: string;
  scheduleTime: string;
  state: string;
  status: { [key: string]: string };
  timeZone: string;
  userUpdateTime: string;
};

type SetOptions = {
  name: string;
  cron: string;
  location: string;
  relativeUrl: string;
};

type JobName = string;

type InputJobNameOptions = Partial<InputOptions<JobName>> & {
  name?: string;
};

async function inputJobName(options?: InputJobNameOptions) {
  const { name } = options;
  return lib.prompts.input({
    arg: name,
    message: 'Scheduled job name',
    validate: cli.validators.notEmpty
  });
}

type Crontab = string;

type InputCrontabOptions = Partial<InputOptions<Crontab>> & {
  cron?: string;
};

async function inputCrontab(options?: InputCrontabOptions) {
  const { cron, ...rest } = options;
  return await lib.prompts.input({
    arg: cron,
    message: 'Crontab for scheduled job',
    validate: cli.validators.cron,
    ...rest
  });
}

type RelativeUrl = string;

type InputRelativeUrlOptions = Partial<InputOptions<RelativeUrl>> & {
  relativeUrl?: string;
};

async function inputRelativeUrl(options?: InputRelativeUrlOptions) {
  const { relativeUrl, ...rest } = options;
  return await lib.prompts.input({
    arg: relativeUrl,
    message: 'URL to call, relative to App Engine instance root',
    validate: cli.validators.isPath
  });
}

export default {
  inputJobName,
  inputCrontab,
  inputRelativeUrl,

  setAppEngineJob: async function(options?: Partial<SetOptions>) {
    let { name, cron, location, relativeUrl } = options;
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
        `scheduler jobs update app-engine ${schedule.name
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
};
