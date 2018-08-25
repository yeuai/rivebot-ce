'use strict';
/**
 * Controller điều khiển các tương tác với dữ liệu lịch sử chat
 * Sử dụng kỹ thuật Await/Async để tối giản các lệnh lập trình
 */

const LIMIT=10

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

        let intent_req = req.param('intent')
        let ner_req = req.param('ner')
        let PAGE = req.param('page')
        let query = {}
        if (!PAGE){
            PAGE = 0 
        } else {
            if (PAGE==1){
                PAGE = 0
            } else{
                PAGE = PAGE - 1
                
            }
            
        }

        let OFFSET = PAGE * LIMIT
        
        if (intent_req){
            query.intent = intent_req

        }
        if(ner_req){
            query.tags = {"$in": [ner_req]}

        }

        let result = await this.chatModel.find(query).skip(OFFSET).limit(LIMIT);
        return res.ok(result);
    }

    /**
     * Create new a chat log
     */
    async create(req, res) {
        let chat = req.body

        if (!chat || typeof chat.text !== 'string') {
            return res.badRequest('Missing chat content: text');
        }

        let result = await this.chatModel.create(chat);
        res.ok(result);
    }

    /**
     * Lấy chi tiết một bản ghi lịch sử chat
     * @param {*} req
     * @param {*} res
     */
    async read(req, res) {  
        let id = req.param('id')
        if (!id) return res.badRequest('missing chat id')

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
        if (!id) return res.badRequest('missing chat id')

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
    async remove(req, res) {
        let id = req.param('id')
        console.log(id)
        if (!id) return res.badRequest('missing chat id')
        if (id==0){
            let result = await this.chatModel.remove({});
            res.ok(result)
            
        } else{
            let result = await this.chatModel.findByIdAndRemove(id);
            res.ok(result)
        }
        // find record details
        // TODO: system intent can not remove (init_conversation, fallback, cancel)
        
    }
}

module.exports = ChatController;
