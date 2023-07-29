import Active from '../lib/active';
import generate from '../lib/generate';

export type Project = {
  createTime: string;
  lifecycleState: string;
  name: string;
  parent: {
    id: string;
    type: string;
  };
  projectId: string;
  projectNumber: string;
};

const active = new Active<Project>(generate.projectId());
export default active;
