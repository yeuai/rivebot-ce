'use strict';
const path = require('path');
const multer = require('multer');
const config = require('config');
const router = require('express').Router();

var upload = multer();

/**
 * Export database
 */
router.get('/api/story/exports', (req, res, next) => {
    if(!config.get('DB_EXPORT')) return res.status(400).send('Not allow!');

    var storyModel = req.kites.db.story;

    storyModel.find()
        .lean()
        .then((result) => {
            res
                .attachment('yeu-ai.json')
                .type('json')
                .send(result)
        })
})

/**
 * Restore database
 */
router.post('/api/story/imports', upload.single('datafile'), (req, res, next) => {
    if(!config.get('DB_IMPORT')) return res.status(400).send('Not allow!');

    var data = req.file.buffer.toString('utf-8');
    var storyModel = req.kites.db.story;

    // clear all data.
    storyModel.remove({})
        .then(() => {
            // parse and import new data.
            var stories = JSON.parse(data)
            return storyModel.create(stories)
        })
        .then(() => {
            res.send('ok');
        })
        .catch((err) => {
            res.status(500)
                .send(err)
        })
})

/**
 * Route user home page
 */
// router.get('*', (req, res) => {
//     res.sendFile(path.join(req.kites.appDirectory, 'public/index.html'));
// })

module.exports = router;
