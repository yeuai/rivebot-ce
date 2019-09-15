import { promisify } from 'util';
import { mkdir, existsSync, readFileSync } from 'fs';
import { KitesInstance } from '@kites/core';
import { StoryModel } from '@api/index';

/**
 * Start mongodb server for development
 * And emit db:connect event with connection string or null
 *
 * @param {kites} kites
 */
async function MongoDbServerDev(kites: KitesInstance) {
  if (kites.options.env === 'development') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const { connection, dbName, dataSource } = kites.options.db;
    const options = dataSource.find(x => x.name === connection);
    const mkdirAsync = promisify(mkdir);
    const dbPath = kites.options.appDirectory + '/.mdb';

    if (!existsSync(dbPath)) {
      await mkdirAsync(dbPath);
    }

    /**
     * Init mongodb server
     */
    const mongod = new MongoMemoryServer({
      instance: {
        dbName,
        dbPath,
        port: parseInt(options.port || 27071, 10),
      },
      binary: {
        version: '4.0.3',
      },
      debug: false,
    });

    const uri = await mongod.getConnectionString();
    const port = await mongod.getPort();
    const dbPathStr = await mongod.getDbPath();
    const dbNameStr = await mongod.getDbName();

    kites.logger.info(`Mongodb server dev started:
        + Uri: ${uri}
        + port: ${port}
        + dbPath: ${dbPathStr}
        + dbName: ${dbNameStr}
    `);

    // Emit connection string
    kites.emit('db:connect', uri, kites);

    if (kites.options.db.imports) {
      try {
        const dbExports = kites.defaultPath('dump/exports/story.default.json');
        const data = readFileSync(dbExports, 'utf8');
        const stories = JSON.parse(data);

        kites.logger.info('Starting import dev db ...');

        await StoryModel.deleteMany({});
        await StoryModel.create(stories);
        kites.logger.info('Import dev db has done!');
      } catch (error) {
        kites.logger.error('Import dev db error: ' + error);
      }
    }

    /**
     * Application stop!
     */
    kites.on('stop', async () => {
      // you may stop mongod manually
      await mongod.stop();
    });
  } else {
    kites.emit('db:connect', null, kites);
  }
}

export {
  MongoDbServerDev,
};
