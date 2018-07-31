/**
 * A simple extension help detecting Environment
 * @param {kites} kites 
 */
module.exports = function (kites) {
    kites.isProd = function () {
        return kites.options.env === 'production';
    }
}