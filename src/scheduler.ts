import cli from '@battis/qui-cli';
import app from './app';
import shell from './shell/index';

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

export default {
  setAppEngineJob: async function({
    name,
    cron,
    location,
    relativeUrl
  }: Partial<SetOptions>) {
    name =
      name ||
      (await cli.prompts.input({
        message: 'Scheduled job name',
        validate: cli.validators.notEmpty
      }));
    cron =
      cron ||
      (await cli.prompts.input({
        message: 'Cron schedule for job',
        validate: cli.validators.cron
      }));
    relativeUrl =
      relativeUrl ||
      (await cli.prompts.input({
        message: 'URL to call, relative to App Engine instance root',
        default: '/',
        validate: cli.validators.isPath
      }));
    location = location || (await app.describe()).locationid;
    let [schedule] = shell.gcloud<Job[]>(
      `scheduler jobs list --filter=appEngineHttpTarget.relativeUri=/sync --location=${location}`
    );
    if (schedule) {
      shell.gcloud(
        `scheduler jobs update app-engine ${schedule.name} --schedule="${cron}"`
      );
    } else {
      schedule = shell.gcloud<Job>(
        `scheduler jobs create app-engine ${name} --schedule="${cron}" --relative-url="${relativeUrl}"`
      );
    }
    return schedule;
  }
};
