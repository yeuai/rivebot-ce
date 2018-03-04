'use strict';
var router = require('express').Router();

router.use('/nlu', require('./nluController'));

module.exports = router;
