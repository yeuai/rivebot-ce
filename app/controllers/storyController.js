'use strict';

const config = require('config')
const router = require('express').Router()
const storyModel = require('../models/story')

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
    storyModel.create(story)
        .then((res) => {
            res.json(res)
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
    storyModel.find({_id: storyId})
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
    storyModel.findByIdAndRemove(storyId)
        .lean()
        .then((result) => {
            res.json(result)
        })
        .catch(err => {
            res.status(500).end(err)
        })
})

module.exports = router;