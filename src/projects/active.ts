import * as lib from '../lib';
import Project from './Project';

const active = new lib.Active<Project>(undefined, 'projectId');

export default active;
