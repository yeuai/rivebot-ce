'use strict';
var router = require('express').Router();

router.use(function _mixinReq(req, res, next) {
    // Flag indicating whether a request would like to receive a JSON response
    //
    // This qualification is determined based on a handful of heuristics, including:
    // • if this looks like an AJAX request
    // • if this is a virtual request from a socket
    // • if this request DOESN'T explicitly want HTML
    // • if this request has a "json" content-type AND ALSO has its "Accept" header set
    // • if this request has the option "wantsJSON" set
    req.wantsJSON = req.xhr;
    req.wantsJSON = req.wantsJSON || req.isSocket;
    req.wantsJSON = req.wantsJSON || !req.explicitlyAcceptsHTML;
    req.wantsJSON = req.wantsJSON || (req.is('json') && req.get('Accept'));
    req.wantsJSON = req.wantsJSON || req.options.wantsJSON;

    req.param = function getParam(param, defaultValue) {
        // If the param exists as a route param, use it.
        if (typeof req.params[param] !== 'undefined') {
            return req.params[param];
        }
        // If the param exists as a body param, use it.
        if (req.body && typeof req.body[param] !== 'undefined') {
            return req.body[param];
        }
        // Return the query param, if it exists.
        return req.query[param] || defaultValue;
    };

    next();
})

router.use('/nlu', require('./nluController'));

module.exports = router;