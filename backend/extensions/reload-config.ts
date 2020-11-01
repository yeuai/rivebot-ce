import { KitesInstance } from '@kites/core';
import { watchFile, existsSync, readFile } from 'fs';

/**
 * App reload configuration
 *
 * @param {kites} kites
 */
function AutoReloadConfig(kites: KitesInstance) {
  function readConfigFile(filename: string) {
    readFile(filename, 'utf-8', (err, data) => {
      try {
        kites.appSettings = data;
      } catch (error) {
        kites.logger.error('reload config file error:', error);
      }
    });
  }

  kites.on('ready', () => {
    if (kites.options.appSettings && existsSync(kites.options.appSettings)) {
      kites.logger.info('Setup auto reload configuration when the configFile changed.');
      readConfigFile(kites.options.appSettings);

      watchFile(kites.options.appSettings, () => {
        kites.logger.info('Config file is changed: ' + kites.options.appSettings);
        readConfigFile(kites.options.appSettings);
      });
    }
  });
}

export {
  AutoReloadConfig,
};
