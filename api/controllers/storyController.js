'use strict';

class StoryController {

    constructor(kites) {
        kites.ready(() => {
            this.storyModel = this.kites.db.story;
        })
    }

    /**
     * Get all stories
     * TODO: filter by bot id
     * TODO: Pagination
     */
    findAll(req, res) {
        // get all stories
        this.storyModel.find({})
            .lean()
            .then((result) => {
                res.json(result)
            })
            .catch(err => {
                res.status(500).end(err)
            })
    }

    /**
     * Create new a story
     */
    create(req, res) {
        let story = req.body
        // console.log('data:', story)
        if (!story || typeof story.intentName !== 'string') {
            return res.status(400).end('Missing intentName')
        }
        story.intentName = story.intentName.replace(/\s+/g, '_')
        this.storyModel.create(story)
            .then((result) => {
                res.json(result)
            })
            .catch((err) => {
                console.error('err:', err)
                res.status(500).end(err)
            })
    }

    read(req, res) {
        let storyId = req.param('storyId')
        if (!storyId) return res.status(400).end('missing story')

        // find record details
        this.storyModel.find({
                _id: storyId
            })
            .lean()
            .then((result) => {
                res.json(result)
            })
            .catch(err => {
                res.status(500).end(err)
            })
    }

    update(req, res) {
        let storyId = req.param('storyId')
        if (!storyId) return res.status(400).end('missing story')

        // find record details
        this.storyModel.update({
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
    }

    delete(req, res) {
        let storyId = req.param('storyId')
        if (!storyId) return res.status(400).end('missing story')

        // find record details
        // TODO: system intent can not remove (init_conversation, fallback, cancel)
        this.storyModel.findByIdAndRemove(storyId)
            .lean()
            .then((result) => {
                res.json(result)
            })
            .catch(err => {
                res.status(500).end(err)
            })
    }

    /**
     * Thêm mới một mẫu học đã được gán nhãn!
     */
    'put /:storyId/labeled' (req, res) {
        let storyId = req.param('storyId')
        if (!storyId) return res.status(400).end('missing story')

        // find record details
        this.storyModel.findOneAndUpdate({
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
    }

    'delete /:storyId/labeled/:labeledId' (req, res) {
        let storyId = req.param('storyId')
        let labeledId = req.param('labeledId')
        if (!storyId || !labeledId || labeledId === 'undefined') return res.status(400).end('missing story or labeled id')

        // find record details
        this.storyModel.update({
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
    }
}

module.exports = StoryController;
// module.exports = class B {};
