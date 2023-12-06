export type User = {
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

export default User;
