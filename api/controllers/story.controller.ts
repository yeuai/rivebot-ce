import { Controller, Get, RequestParam, QueryParam, RequestBody, Request, Post, Put, Delete, Response } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { StoryModel } from 'api/models';
import { uploadMemory } from './upload.multer';

/**
 * Story controller
 */
@Controller('/story')
export class StoryController {

  constructor(
    @Inject(KITES_INSTANCE) private kites: KitesInstance,
  ) {

  }

  /**
   * Xuất dữ liệu db của ứng dụng
   * Move lên đầu, tránh trùng với GET /api/story/:id
   * @param res
   */
  @Get('/exports')
  async export(@Response() res) {
    this.kites.logger.info('Preparing exports stories!');
    res.attachment('yeu-ai.json').type('json');
    const result = await StoryModel.find({}).lean();
    return result;
  }

  /**
   * Get all stories
   * TODO: filter by bot id
   * TODO: Pagination
   */
  @Get('/')
  async findAll(req, res) {
    // get all stories
    const result = await StoryModel.find({}).limit(1000).lean();
    return result;
  }

  /**
   * Create new a story
   */
  @Post('/')
  async create(
    @RequestBody() story: any,
  ) {
    if (!story || typeof story.intentName !== 'string') {
      throw new Error('Missing intentName');
    }

    story.intentName = story.intentName.replace(/\s+/g, '_');
    const result = await StoryModel.create(story);
    return result;
  }

  /**
   * Chi tiết một kịch bản
   * Lưu ý: Api GET có thể bị trùng với /api/story/something
   */
  @Get('/:id')
  async read(
    @RequestParam('id') storyId: string,
  ) {
    if (!storyId) { throw new Error('missing story'); }

    // find record details
    const result = await StoryModel.find({
      _id: storyId,
    }).lean();

    return result;
  }

  @Put('/:id')
  async update(
    @RequestParam('id') storyId: string,
    @RequestBody() body: any,
  ) {
    if (!storyId) { throw new Error('missing story'); }

    // find record details
    const result = await StoryModel.update({
      _id: storyId,
    }, {
      $set: body,
    }).lean();

    return result;
  }

  /**
   * Hàm xóa kịch bản theo id
   * @param {*} req
   * @param {*} res
   */
  @Delete('/:id')
  async remove(
    @RequestParam('id') storyId: string,
  ) {
    if (!storyId) { throw new Error('missing story'); }

    // find record details
    // TODO: system intent can not remove (init_conversation, fallback, cancel)
    const result = await StoryModel.findByIdAndRemove(storyId).lean();
    return result;
  }

  /**
   * Thêm mới một mẫu học đã được gán nhãn!
   */
  @Put('/:storyId/labeled')
  async updateStoryLabel(
    @RequestParam('storyId') storyId: string,
    @RequestBody() body: any,
  ) {
    if (!storyId) { throw new Error('missing story'); }

    // find record details
    const result = await StoryModel.findOneAndUpdate({
      _id: storyId,
    }, {
      $push: {
        labeledSentences: {
          data: body,
          text: body.map((v) => v[0]).join(' '),
        },
      },
    }, {
      new: true,
    })
      .select('labeledSentences')
      .lean();

    return result;
  }

  @Delete('/:storyId/labeled/:labeledId')
  async removeStoryLabel(
    @RequestParam('storyId') storyId: string,
    @RequestParam('labeledId') labeledId: string,
  ) {
    if (!storyId || !labeledId || labeledId === 'undefined') {
      throw new Error('missing story or labeled id');
    }

    // find record details
    const data: any = {
      _id: labeledId,
    };
    const result = await StoryModel.update({
      _id: storyId,
    }, {
      $pull: {
        labeledSentences: data,
      },
    }).lean();

    return result;
  }

  /**
   * Hàm lưu file upload & import db
   * @param req e.Request
   */
  @Post('/imports', uploadMemory.single('datafile'))
  async import(@Request() req) {
    const msg = 'import ok!';
    const data = req.file.buffer.toString('utf-8');
    const stories = JSON.parse(data);

    await StoryModel.deleteMany({});
    await StoryModel.create(stories);

    this.kites.logger.info(`File recently uploaded & imported!`);
    return { msg };
  }
}
