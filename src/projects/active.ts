import * as lib from '../lib.js';
import { Project } from './Project.js';

export const active = new lib.Active<Project>(undefined, 'projectId');
