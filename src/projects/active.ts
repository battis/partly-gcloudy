import * as lib from '#lib';
import { Project } from './Project.js';

export const active = new lib.Active<Project>(undefined, 'projectId');
