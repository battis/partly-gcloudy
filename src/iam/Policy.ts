export type PolicyBinding = {
  members: string[];
  role: string;
};

export type Policy = {
  bindings: PolicyBinding[];
  etag: string;
  version: number;
};
