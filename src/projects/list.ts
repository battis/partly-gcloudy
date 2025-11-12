import * as shell from '../shell/index.js';
import { Project } from './Project.js';

export async function list() {
  return await shell.gcloud<Project[]>('projects list', {
    includeProjectIdFlag: false
  });
}
