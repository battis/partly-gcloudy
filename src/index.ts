import app from './app';
import batch from './batch';
import billing from './billing';
import core from './core';
import iam from './iam';
import iap from './iap';
import lib from './lib';
import projects from './projects';
import scheduler from './scheduler';
import secrets from './secretManager';
import services from './services';
import shell from './shell';
import sql from './sql';

export default {
  ...core,
  lib,
  batch,

  app,
  appEngine: app,

  iam,
  identityAccessManagement: iam,

  iap,
  identityAwareProxy: iap,

  secrets,
  secretManager: secrets,

  projects,

  /** @deprecated use {@link projects} */
  project: projects,

  billing,
  shell,
  scheduler,
  services,
  sql
};
