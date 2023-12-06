import cli from '@battis/qui-cli';
import appRootPath from 'app-root-path';
import path from 'path';
import * as app from '../app';
import * as core from '../core';
import * as lib from '../lib';
import * as projects from '../projects';
import * as sql from '../sql';
import ConditionalEnvFile from './ConditionalEnvFile';

export type CreateMySqlInstanceOptions = {
  project?: projects.Project;
  appEngine?: boolean | app.AppEngine;
  region?: string;
  tier?: string;
  instanceName?: string;
  rootPassword?: string;
  databaseName?: string;
  username?: string;
  password?: string;
  env: ConditionalEnvFile & {
    keys: {
      dbSocket?: string;
      dbHost?: string;
      dbPort?: string;
      dbRootPassword?: string;
      dbDatabase?: string;
      dbUsername?: string;
      dbPassword?: string;
    };
  };
};

export default async function createMySqlInstance(
  options?: CreateMySqlInstanceOptions
) {
  const _args = core.init();
  let {
    project,
    appEngine,
    region,
    instanceName,
    rootPassword,
    databaseName,
    username,
    password
  } = options || {};
  const { tier, env } = options || {};
  if (core.ready()) {
    project = project || (await projects.describe());
    if (!project) {
      throw new Error('Project unknown');
    }
    projects.active.activate(project);
    appEngine = appEngine === true ? await app.describe() : appEngine;
    if (
      appEngine &&
      appEngine.locationId &&
      (await cli.prompts.confirm({
        message: `Use region ${cli.colors.value(appEngine.locationId)}`
      }))
    ) {
      region = appEngine.locationId;
    } else {
      region = await app.regions.selectIdentifier({ region });
    }

    // create Cloud SQL MySQL instance with App Engine access
    instanceName = await sql.instances.inputIdentifier({
      region:
        region ||
        (appEngine !== false &&
          appEngine !== undefined &&
          appEngine.locationId) ||
        undefined,
      name: instanceName,
      default: project.name
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-*(.+)-*$/, '$1')
    });
    const sqlInstance = await sql.instances.create({
      name: instanceName,
      region,
      tier
    });
    const file = path.resolve(
      appRootPath.toString(),
      (typeof env === 'string' && env) ||
        (typeof env === 'object' && env.path) ||
        '.env'
    );
    const {
      dbRootPassword = 'DB_ROOT_PASSWORD',
      dbSocket = 'DB_SOCKET',
      dbHost = 'DB_HOST',
      dbPort = 'DB_PORT',
      dbDatabase = 'DB_DATABASE',
      dbUsername = 'DB_USERNAME',
      dbPassword = 'DB_PASSWORD'
    } = typeof env === 'object' ? env.keys : {};
    const socket = `/cloudsql/${sqlInstance.connectionName}`;
    if (env) {
      if (appEngine) {
        cli.env.set({
          key: dbSocket,
          value: socket,
          file: file,
          comment: cli.env.exists({ key: dbSocket, file: file })
            ? undefined
            : 'Cloud SQL MySQL credentials'
        });
        cli.env.set({ key: dbHost, value: '', file });
        cli.env.set({ key: dbPort, value: '', file });
      } else {
        cli.env.set({
          key: dbHost,
          value: sqlInstance.ipAddresses[0].ipAddress,
          file
        });
        cli.env.set({ key: dbPort, value: '3306', file });
      }
    }

    const deploy = (env && cli.env.parse(file)) || {};

    // secure root user
    rootPassword = await sql.users.setPassword({
      username: 'root',
      password: rootPassword || deploy.DB_ROOT_PASSWORD
    });
    if (env) {
      cli.env.set({
        key: dbRootPassword,
        value: rootPassword,
        file
      });
    }
    // create user and database
    username = await sql.users.inputIdentifier({
      username: username || deploy.DB_USERNAME,
      default: instanceName
    });
    password = await sql.users.inputPassword({
      password: password || deploy.DB_PASSWORD,
      purpose: `for MySQL user ${cli.colors.value(username)}`
    });
    let user = await sql.users.describe({ username });
    if (user) {
      password = await sql.users.setPassword({
        username,
        password
      });
    } else {
      user = await sql.users.create({
        username,
        password,
        host:
          (appEngine !== false &&
            appEngine !== undefined &&
            appEngine.defaultHostname) ||
          undefined
      });
    }
    if (env) {
      cli.env.set({ key: dbUsername, value: username, file });
      cli.env.set({ key: dbPassword, value: password, file });
    }

    databaseName = await sql.databases.inputIdentifier({
      name: databaseName || deploy.DB_DATABASE,
      default: instanceName
    });
    let database =
      databaseName &&
      (await lib.prompts.confirm.reuse({
        instance: await sql.databases.describe({
          name: databaseName
        }),
        argDescription: 'MySQL database'
      }));
    if (databaseName && !database) {
      databaseName = await sql.databases.inputIdentifier();
      database = undefined;
    }
    if (!database) {
      database = await sql.databases.create({
        name: databaseName
      });
    }
    if (env) {
      cli.env.set({
        key: dbDatabase,
        value: database.name,
        file
      });
    }

    return {
      instance: sql,
      database,
      user,
      env: {
        [dbSocket]: socket,
        [dbHost]: '',
        [dbPort]: '',
        [dbRootPassword]: rootPassword,
        [dbDatabase]: database.name,
        [dbUsername]: user.name,
        [dbPassword]: password
      }
    };
  }
  return false;
}
