'use strict';
const path = require('path');
const routes = require('../routes');

/**
 * Routes management
 *
 * @param {kites} kites
 */
module.exports = function (kites) {
    kites.on('expressConfigure', (app) => {
        kites.logger.info('Configure page views ...');

        /**
         * setup pages
         */
        app.get('/admin', (req, res) => res.view('admin'));
        app.get('/about', (req, res) => res.view('about'));


        /**
         * config routes (advanced)
         */
        app.use(routes);

        /**
         * Route user home page (default)
         */
        kites.ready(() => {
            /**
             * Add thêm middleware cuối cùng
             * Đảm bảo rằng các cấu hình khác đã hoàn tất
             * Các resource (api + static assets) không tìm thấy (Not Found) sẽ trả về view index.html
             */
            app.use((req, res, next) => {
                if (!req.route) {
                    return res.sendFile(path.join(kites.appDirectory, 'public/index.html'));
                } else {
                    next();
                }
            })
        })
    });
}
