import { KitesInstance } from '@kites/core';
import { Express } from '@kites/express';
import { join } from 'path';

/**
 * Routes management
 *
 * @param {kites} kites
 */
function appRoutes(kites: KitesInstance) {
  kites.on('express:config', (app: Express) => {
    kites.logger.info('Configure page views ...');

    app.get('/admin', (req, res) => res.view('admin'));
    app.get('/about', (req, res) => res.view('about'));

  });
  kites.on('after:express:config', () => {
    /**
     * Add thêm middleware cuối cùng
     * Đảm bảo rằng các cấu hình khác đã hoàn tất
     * Các resource (api + static assets) không tìm thấy (Not Found) sẽ trả về view index.html
     */
    kites.express.app.use((req, res, next) => {
      if (!req.route) {
        return res.status(404).sendFile(join(kites.appDirectory, 'public/index.html'));
      } else {
        next();
      }
    });

    kites.express.app.use((err, req, res, next) => {
      kites.logger.error('Express handle error: ' + err && err.stack);
      res.status(500).json(err);
    });
  });
}

export {
  appRoutes,
};
