export type Version = {
  clientSpecifiedPayloadChecksum: boolean;
  createTime: string;
  etag: string;
  name: string;
  replicationStatus: object;
  state: 'ENABLED' | 'DISABLED' | 'DESTROYED';
};
