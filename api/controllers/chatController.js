'use strict';
/**
 * Controller điều khiển các tương tác với dữ liệu lịch sử chat
 * Sử dụng kỹ thuật Await/Async để tối giản các lệnh lập trình
 */
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
    async findAll(req, res) {
        // get all stories
        let result = await this.chatModel.find({});
        res.ok(result);
    }

    /**
     * Create new a story
     */
    async create(req, res) {
        let chat = req.body
        if (!chat || typeof chat.text !== 'string') {
            return res.badRequest('Missing chat content: text');
        }

        let result = await this.storyModel.create(chat);
        res.ok(result);
    }

    /**
     * Lấy chi tiết một bản ghi lịch sử chat
     * @param {*} req
     * @param {*} res
     */
    async read(req, res) {
        let id = req.param('id')
        if (!id) return res.badRequest('missing story')

        // find record details
        let result = await this.chatModel.findById(id);
        res.ok(result);
    }

    /**
     * Hàm cập nhật nội dung chat theo id
     * @param {*} req
     * @param {*} res
     */
    async update(req, res) {
        let id = req.param('id')
        if (!id) return res.badRequest('missing story')

        // find record details
        // cập nhật toàn bộ nội dung chat theo id
        let result = await this.chatModel.update({
            _id: id
        }, {
            $set: req.body
        });

        res.ok(result)
    }

    /**
     * Hàm xóa nội dung 1 bản ghi lịch sử chat
     * @param {*} req
     * @param {*} res
     */
    async delete(req, res) {
        let id = req.param('id')
        if (!id) return res.badRequest('missing chat id')

        // find record details
        // TODO: system intent can not remove (init_conversation, fallback, cancel)
        let result = await this.chatModel.findByIdAndRemove(id);
        res.ok(result)
    }

}

module.exports = ChatController;
