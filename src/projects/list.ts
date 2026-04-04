import { gcloud } from '#shell';
import { Project } from './Project.js';

export async function list() {
  return await gcloud<Project[]>('projects list', {
    includeProjectIdFlag: false
  });
}
