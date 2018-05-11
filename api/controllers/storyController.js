'use strict';

const config = require('config')
const multer = require('multer')
const router = require('express').Router()
const storyModel = require('../models/story')

var upload = multer()

/**
 * Export database
 */
router.get('/exports', (req, res, next) => {
    if(!config.get('DB_EXPORT')) return res.status(400).send('Not allow!');

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
router.post('/imports', upload.single('datafile'), (req, res, next) => {
    if(!config.get('DB_IMPORT')) return res.status(400).send('Not allow!');

    var data = req.file.buffer.toString('utf-8')
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
 * Get all stories
 * TODO: filter by bot id
 * TODO: Pagination
 */
router.get('/', (req, res, next) => {
    // get all stories
    storyModel.find({})
        .lean()
        .then((result) => {
            res.json(result)
        })
        .catch(err => {
            res.status(500).end(err)
        })
})

/**
 * Create new a story
 */
router.post('/', (req, res, next) => {
    let story = req.body
    // console.log('data:', story)
    if (!story || typeof story.intentName !== 'string') {
        return res.status(400).end('Missing intentName')
    }
    story.intentName = story.intentName.replace(/\s+/g, '_')
    storyModel.create(story)
        .then((result) => {
            res.json(result)
        })
        .catch((err) => {
            console.error('err:', err)
            res.status(500).end(err)
        })
})

router.get('/:storyId', (req, res, next) => {
    let storyId = req.param('storyId')
    if (!storyId) return res.status(400).end('missing story')

    // find record details
    storyModel.find({
            _id: storyId
        })
        .lean()
        .then((result) => {
            res.json(result)
        })
        .catch(err => {
            res.status(500).end(err)
        })
})

router.put('/:storyId', (req, res, next) => {
    let storyId = req.param('storyId')
    if (!storyId) return res.status(400).end('missing story')

    // find record details
    storyModel.update({
            _id: storyId
        }, {
            $set: req.body
        })
        .lean()
        .then((result) => {
            res.json(result)
        })
        .catch(err => {
            res.status(500).end(err)
        })
})

router.delete('/:storyId', (req, res, next) => {
    let storyId = req.param('storyId')
    if (!storyId) return res.status(400).end('missing story')

    // find record details
    // TODO: system intent can not remove (init_conversation, fallback, cancel)
    storyModel.findByIdAndRemove(storyId)
        .lean()
        .then((result) => {
            res.json(result)
        })
        .catch(err => {
            res.status(500).end(err)
        })
})

/**
 * Thêm mới một mẫu học đã được gán nhãn!
 */
router.put('/:storyId/labeled', (req, res, next) => {
    let storyId = req.param('storyId')
    if (!storyId) return res.status(400).end('missing story')

    // find record details
    storyModel.findOneAndUpdate({
            _id: storyId
        }, {
            $push: {
                labeledSentences: {
                    data: req.body,
                    text: req.body.map((v) => v[0]).join(' ')
                }
            }
        }, {
            new: true
        })
        .select('labeledSentences')
        .lean()
        .then((result) => {
            res.json(result)
        })
        .catch(err => {
            res.status(500).end(err)
        })
})

router.delete('/:storyId/labeled/:labeledId', (req, res, next) => {
    let storyId = req.param('storyId')
    let labeledId = req.param('labeledId')
    if (!storyId || !labeledId || labeledId === 'undefined') return res.status(400).end('missing story or labeled id')

    // find record details
    storyModel.update({
            _id: storyId
        }, {
            $pull: {
                labeledSentences: {
                    _id: labeledId
                }
            }
        })
        .lean()
        .then((result) => {
            res.json(result)
        })
        .catch(err => {
            res.status(500).end(err && err.toString())
        })
})

module.exports = router;