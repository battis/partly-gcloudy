import * as lib from '../lib';
import Project from './Project';

export const active = new lib.Active<Project>(undefined, 'projectId');

export default active;
