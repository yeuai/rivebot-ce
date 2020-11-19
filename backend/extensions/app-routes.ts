import { KitesInstance } from '@kites/core';
import { getLogger } from '@kites/core/logger';
import { Express } from '@kites/express';
import { format, transports } from 'winston';
import proxy from 'express-http-proxy/';

const logger = getLogger('BotScript', {
  format: format.combine(
    format.errors({ stack: true }),
    format.metadata(),
    format.json(),
  ),
  transports: [
    new transports.Console(),
  ],
});

logger.add(new transports.Console());

/**
 * Routes management
 *
 * @param {kites} kites
 */
function AppRoutes(kites: KitesInstance) {
  kites.on('express:config', (app: Express) => {
    kites.logger.info('Configure page views ...');

    /**
     * common options
     */
    app.use((req, res, next) => {
      // config application version
      req.options = req.options || {};
      req.options.locals = req.options.locals || {};
      req.options.locals.version = kites.options.version;
      next();
    });

    // main pages
    app.get('/admin', (req, res) => res.view('admin'));
    app.get('/about', (req, res) => res.view('about'));

    // app configuration
    app.get('/_settings.js', (req, res) => {
      res.type('text/javascript')
        .send(`window._appsettings=JSON.parse(\`${kites.appSettings || '{}'}\`)`);
    });

    // config for development
    if (kites.options.env === 'development') {
      app.use(proxy('localhost:4200'));
    }

    // error handler
    app.use((err, req, res, next) => {
      if (typeof err === 'string') {
        kites.logger.error('Server Error: ' + err);
      } else if (err.name === 'UnauthorizedError') {
        kites.logger.error('Request is not authorized ' + err);
        return res.status(401).send('invalid token');
      } else {
        logger.error(err);
      }

      // No more processing.
      return res.status(500).json(err.message);
    });
  });

  /**
   * Cấu hình file tĩnh
   */
  kites.on('express:config:static', async (app: Express) => {
    const e = await import('express');
    app.use(e.static('build/client'));
    app.get('/*', (req, res) => res.view('index'));
  });
}

export {
  AppRoutes,
};
