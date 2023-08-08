type Secret = {
  createTime: string;
  etag: string;
  name: string;
  replication: { [key: string]: string };
};

export type { Secret as default };
