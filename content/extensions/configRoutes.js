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
        app.get('/', (req, res) => res.view('index'));
        app.get('/admin', (req, res) => res.view('admin'));
        app.get('/about', (req, res) => res.view('about'));


        /**
         * config routes (advanced)
         */
        app.use(routes);

        /**
         * Route user home page (default)
         */
        app.get('/*', (req, res) => res.sendFile(path.join(kites.appDirectory, 'public/index.html')));
    });
}
