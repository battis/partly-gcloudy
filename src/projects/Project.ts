type Project = {
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

export default Project;
