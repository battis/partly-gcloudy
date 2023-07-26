import app from './app';
import billing from './billing';
import core from './core';
import iam from './iam';
import iap from './iap';
import project from './project';
import scheduler from './scheduler';
import secrets from './secretManager';
import services from './services';
import shell from './shell';
import sql from './sql';

export default {
  ...core,

  app,
  appEngine: app,

  iam,
  identityAccessManagement: iam,

  iap,
  identityAwareProxy: iap,

  secrets,
  secretManager: secrets,

  billing,
  shell,
  project,
  scheduler,
  services,
  sql
};
