import { Controller, Get, RequestParam, QueryParam, Post, Put, Delete } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { Chat, ChatModel } from '../models';

/**
 * Controller điều khiển các tương tác với dữ liệu lịch sử chat
 * Sử dụng kỹ thuật Await/Async để tối giản các lệnh lập trình
 */

const LIMIT = 10;

@Controller('/chat')
export class ChatController {

  constructor(
    @Inject(KITES_INSTANCE) private kites: KitesInstance,
  ) {

  }

  /**
   * Get all stories
   * TODO: filter by bot id
   * TODO: Pagination
   */
  @Get('/')
  async findAll(req, res) {
    // get all stories

    const intent_req = req.param('intent');
    const ner_req = req.param('ner');
    let PAGE = req.param('page');
    const query: any = {};
    if (!PAGE) {
      PAGE = 0;
    } else {
      if (PAGE === 1) {
        PAGE = 0;
      } else {
        PAGE = PAGE - 1;
      }
    }

    const OFFSET = PAGE * LIMIT;

    if (intent_req) {
      query.intent = intent_req;

    }
    if (ner_req) {
      query.tags = { $in: [ner_req] };

    }

    const result = await ChatModel.find(query).skip(OFFSET).limit(LIMIT);
    return res.ok(result);
  }

  /**
   * Create new a chat log
   */
  @Post('/')
  async create(req, res) {
    const chat = req.body;

    if (!chat || typeof chat.text !== 'string') {
      return res.badRequest('Missing chat content: text');
    }

    const result = await ChatModel.create(chat);
    res.ok(result);
  }

  /**
   * Lấy chi tiết một bản ghi lịch sử chat
   * @param {*} req
   * @param {*} res
   */
  @Get('/:id')
  async read(req, res) {
    const id = req.param('id');
    if (!id) { return res.badRequest('missing chat id'); }

    // find record details
    const result = await ChatModel.findById(id);
    return result;
  }

  /**
   * Hàm cập nhật nội dung chat theo id
   * @param {*} req
   * @param {*} res
   */
  @Put('/:id')
  async update(req, res) {
    const id = req.param('id');
    if (!id) { return res.badRequest('missing chat id'); }

    // find record details
    // cập nhật toàn bộ nội dung chat theo id
    const result = await ChatModel.update({
      _id: id,
    }, {
      $set: req.body,
    });

    res.ok(result);
  }

  /**
   * Hàm xóa nội dung 1 bản ghi lịch sử chat
   * @param {*} req
   * @param {*} res
   */
  @Delete('/:id')
  async remove(req, res) {
    const id = req.param('id');
    console.log(id);
    if (!id) { return res.badRequest('missing chat id'); }
    if (id === 0) {
      const result = await ChatModel.remove({});
      res.ok(result);

    } else {
      const result = await ChatModel.findByIdAndRemove(id);
      res.ok(result);
    }
    // find record details
    // TODO: system intent can not remove (init_conversation, fallback, cancel)

  }
}
