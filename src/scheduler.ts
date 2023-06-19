import cli from '@battis/cli';
import * as appEngine from './appEngine';
import invoke from './invoke';

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

export async function setAppEngineJob({
  name,
  cron,
  location,
  relativeUrl
}: Partial<SetOptions>) {
  name =
    name ||
    (await cli.io.prompts.input({
      message: 'Scheduled job name',
      validate: cli.io.validators.notEmpty
    }));
  cron =
    cron ||
    (await cli.io.prompts.input({
      message: 'Cron schedule for job',
      validate: cli.io.validators.cron
    }));
  relativeUrl =
    relativeUrl ||
    (await cli.io.prompts.input({
      message: 'URL to call, relative to App Engine instance root',
      default: '/',
      validate: cli.io.validators.isPath
    }));
  location = location || (await appEngine.describe()).locationid;
  let [schedule] = await invoke<Job[]>(
    `scheduler jobs list --filter=appEngineHttpTarget.relativeUri=/sync --location=${location}`
  );
  if (schedule) {
    await invoke(
      `scheduler jobs update app-engine ${schedule.name} --schedule="${cron}"`
    );
  } else {
    schedule = await invoke<Job>(
      `scheduler jobs create app-engine ${name} --schedule="${cron}" --relative-url="${relativeUrl}"`
    );
  }
  return schedule;
}
