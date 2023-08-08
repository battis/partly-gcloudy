type User = {
  etag: string;
  host: string;
  instance: string;
  kind: string;
  name: string;
  passwordPolicy: {
    status: object;
  };
  project: string;
};

export type { User as default };
