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
    async findAll(req, res) {
        // get all stories
        let result = await this.storyModel.find({}).lean();
        res.ok(result);
    }

    /**
     * Create new a story
     */
    async create(req, res) {
        let story = req.body
        // console.log('data:', story)
        if (!story || typeof story.intentName !== 'string') {
            return res.badRequest('Missing intentName');
        }

        story.intentName = story.intentName.replace(/\s+/g, '_');
        let result = await this.storyModel.create(story);
        res.ok(result);
    }

    async read(req, res) {
        let storyId = req.param('id')
        if (!storyId) return res.badRequest('missing story');

        // find record details
        let result = await this.storyModel.find({
                _id: storyId
            })
            .lean();

        res.ok(result);
    }

    async update(req, res) {
        let storyId = req.param('id')
        if (!storyId) return res.badRequest('missing story');

        // find record details
        let result = await this.storyModel.update({
                _id: storyId
            }, {
                $set: req.body
            })
            .lean();

        res.ok(result);
    }

    /**
     * Hàm xóa kịch bản theo id
     * @param {*} req
     * @param {*} res
     */
    async remove(req, res) {
        let storyId = req.param('id')
        if (!storyId) return res.badRequest('missing story');

        // find record details
        // TODO: system intent can not remove (init_conversation, fallback, cancel)
        let result = await this.storyModel.findByIdAndRemove(storyId).lean();
        res.ok(result);
    }

    /**
     * Thêm mới một mẫu học đã được gán nhãn!
     */
    async 'put /:storyId/labeled' (req, res) {
        let storyId = req.param('storyId')
        if (!storyId) return res.badRequest('missing story');

        // find record details
        let result = await this.storyModel.findOneAndUpdate({
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
            .lean();

        res.ok(result);
    }

    async 'delete /:storyId/labeled/:labeledId' (req, res) {
        let storyId = req.param('storyId')
        let labeledId = req.param('labeledId')

        if (!storyId || !labeledId || labeledId === 'undefined') {
            return res.badRequest('missing story or labeled id')
        }

        // find record details
        let result = await this.storyModel.update({
                _id: storyId
            }, {
                $pull: {
                    labeledSentences: {
                        _id: labeledId
                    }
                }
            })
            .lean();

        res.ok(result);
    }
}

module.exports = StoryController;
