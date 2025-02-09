import * as app from './app.js';
import * as batch from './batch.js';
import * as billing from './billing.js';
import * as core from './core.js';
import * as iam from './iam.js';
import * as iap from './iap.js';
import * as projects from './projects.js';
import * as scheduler from './scheduler.js';
import * as secrets from './secrets.js';
import * as services from './services.js';
import * as sql from './sql.js';

import cli from '@battis/qui-cli';
import * as plugin from '@battis/qui-cli.plugin';

export class gcloud extends plugin.Base {
  public app = app;
  public batch = batch;
  public billing = billing;
  public iam = iam;
  public identityAccessManagement = iam;
  public iap = iap;
  public identityAwareProxy = iap;
  public projects = projects;
  public scheduler = scheduler;
  public secrets = secrets;
  public secretManager = secrets;
  public services = services;
  public sql = sql;

  public ready = core.ready;
  public args = core.args;

  private static singleton: gcloud;
  public static getInstance() {
    if (!this.singleton) {
      this.singleton = new gcloud();
    }
    return this.singleton;
  }
  public constructor() {
    super('gcloud');
    if (gcloud.singleton) {
      throw new Error('gcloud is a singleton');
    } else {
      gcloud.singleton = this;
    }
  }

  public options(): plugin.Options {
    return {
      flag: {
        verbose: {
          short: 'v',
          description: 'Show verbose output (commands and results)'
        }
      },
      opt: {
        project: {
          short: 'p',
          description: 'Google Cloud project ID'
        },
        projectEnvVar: {
          description:
            'Environment variable that stores Google Cloud project ID',
          default: 'PROJECT'
        }
      }
    };
  }

  public init({
    values: { verbose, project, projectEnvVar }
  }: plugin.Arguments<ReturnType<this['options']>>): void {
    core.init({
      values: {
        verbose: !!verbose,
        project: project?.toString(),
        projectEnvVar: projectEnvVar!.toString()
      }
    });
  }
}

const g = gcloud.getInstance();
cli.register(g);

export { g as default };
