import { Controller, Get, RequestParam, QueryParam, RequestBody, Request } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import * as handlebars from 'handlebars';

import { NerService, NLUService, IntentService } from 'api/services';
import { StoryModel } from 'api/models';
import { Request as ExpressRequest } from '@kites/express';

/**
 * NLP controller
 */
@Controller('/nlu')
export class NLUController {
  DEFAULT_WELCOME_INTENT_NAME: string;
  DEFAULT_FALLBACK_INTENT_NAME: string;

  constructor(
    @Inject(KITES_INSTANCE) private kites: KitesInstance,
    private nerService: NerService,
    private nluService: NLUService,
    private intentService: IntentService,
  ) {
    this.kites.logger.debug('Init NLU controller!');
    this.DEFAULT_FALLBACK_INTENT_NAME = this.kites.options.modelConfig.DEFAULT_FALLBACK_INTENT_NAME;
    this.DEFAULT_WELCOME_INTENT_NAME = this.kites.options.modelConfig.DEFAULT_WELCOME_INTENT_NAME;
  }

  /**
   * Huấn luyện dữ liệu theo kịch bản được thiết kế bởi Rivebot
   * @param {*} req
   * @param {*} res
   */
  @Get('/train/:id')
  async train(
    @RequestParam('id') storyId: string,
  ) {
    await this.intentService.train();
    const result = await this.nerService.trainStory(storyId);
    return result;
  }

  /**
   * Hàm lý luận dựa vào dữ kiện kịch bản và ý định của khách hàng
   * Trả về một đoạn văn bản mà khách hàng mong muốn nhận được câu trả lời
   * @param {*} req
   * @param {*} res
   */
  @Get('/chat/:text')
  async chat(
    @RequestParam('text') input: string,
    @Request() req: ExpressRequest,
  ) {
    this.kites.logger.info('New request: ' + input);
    const complete = req.param('complete');
    const context = req.param('context', {});

    if (input === this.DEFAULT_WELCOME_INTENT_NAME) {
      const defaultStory = await StoryModel.findOne({
        intentName: this.DEFAULT_WELCOME_INTENT_NAME,
      }).lean();

      if (!defaultStory) {
        this.kites.logger.error('No default story: ' + this.DEFAULT_WELCOME_INTENT_NAME);
        throw new Error('Story: ' + input);
      }

      const result = req.body;
      result.input = input;
      result.complete = true;
      result.intent = {
        name: defaultStory.storyName,
        storyId: defaultStory._id.toString(),
      };
      result.speechResponse = defaultStory.speechResponse;
      return result;
    }

    let intentName = await this.intentService.predict(input);
    if (!intentName) { intentName = this.DEFAULT_FALLBACK_INTENT_NAME; }
    const story = await StoryModel.findOne({ intentName }).lean();

    let responseResult;
    if (complete === 'false') {
      responseResult = await this.nluService.buildNonCompleteResponse(story, req);
    } else {
      responseResult = await this.nluService.buildCompleteResponse(story, req);
    }

    if (responseResult.complete) {
      if (story.apiTrigger) {
        // call api
      }
      const template = handlebars.compile(story.speechResponse);
      responseResult.speechResponse = template(responseResult.extractedParameters);
    }

    return responseResult || 'Unknow!!';
  }

}
