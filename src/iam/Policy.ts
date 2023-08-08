type PolicyBinding = {
  members: string[];
  role: string;
};

type Policy = {
  bindings: PolicyBinding[];
  etag: string;
  version: number;
};

export type { Policy as default };
