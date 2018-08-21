'use strict';

class ChatController {

    constructor(kites) {
        kites.ready(() => {
            this.chatModel = this.kites.db.chat;
        })
    }

    /**
     * Get all stories
     * TODO: filter by bot id
     * TODO: Pagination
     */
    findAll(req, res) {
        // get all stories
        this.chatModel.find({})
            .lean()
            .then((result) => {
                res.ok(result)
            })
            .catch(err => {
                res.nok(err)
            })
    }

    /**
     * Create new a story
     */
    create(req, res) {
        let chat = req.body
        if (!chat || typeof chat.text !== 'string') {
            return res.badRequest('Missing chat content: text');
        }

        this.storyModel.create(chat)
            .then((result) => {
                res.ok(result)
            })
            .catch((err) => {
                console.error('err:', err)
                res.nok(err)
            })
    }

    read(req, res) {
        let id = req.param('id')
        if (!id) return res.badRequest('missing story')

        // find record details
        this.chatModel.find({
                _id: id
            })
            .lean()
            .then((result) => {
                res.ok(result)
            })
            .catch(err => {
                res.nok(err)
            })
    }

    update(req, res) {
        let id = req.param('id')
        if (!id) return res.badRequest('missing story')

        // find record details
        this.chatModel.update({
                _id: id
            }, {
                $set: req.body
            })
            .lean()
            .then((result) => {
                res.ok(result)
            })
            .catch(err => {
                res.nok(err)
            })
    }

    delete(req, res) {
        let id = req.param('id')
        if (!id) return res.badRequest('missing chat id')

        // find record details
        // TODO: system intent can not remove (init_conversation, fallback, cancel)
        this.chatModel.findByIdAndRemove(id)
            .lean()
            .then((result) => {
                res.ok(result)
            })
            .catch(err => {
                res.nok(err)
            })
    }

}

module.exports = ChatController;
