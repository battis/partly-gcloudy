export type Job = {
  appEngineHttpTarget?: {
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
