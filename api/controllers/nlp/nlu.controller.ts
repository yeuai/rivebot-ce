import { Controller, Get, RequestParam, QueryParam, RequestBody, Request, Post } from '@kites/rest';
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

  constructor(
    @Inject(KITES_INSTANCE) private kites: KitesInstance,
    private svNER: NerService,
    private svNLU: NLUService,
    private svIntent: IntentService,
  ) {
    this.kites.logger.debug('Init NLU controller!');
  }

  /**
   * Huấn luyện dữ liệu theo kịch bản được thiết kế bởi Rivebot
   * @param {*} req
   * @param {*} res
   */
  @Post('/train/:id')
  async train(
    @RequestParam('id') storyId: string,
  ) {
    await this.svIntent.train();
    const result = await this.svNER.trainStory(storyId);
    return result;
  }

  /**
   * Hàm lý luận dựa vào dữ kiện kịch bản và ý định của khách hàng
   * Trả về một đoạn văn bản mà khách hàng mong muốn nhận được câu trả lời
   * @param {*} req
   * @param {*} res
   */
  @Post('/chat/:text')
  async chat(
    @RequestParam('text') input: string,
    @RequestBody() body: any,
  ) {
    this.kites.logger.info('New request: ' + input);
    const complete = body.complete;
    const context = body.context;

    if (input === this.svIntent.DefaultWelcome) {
      const defaultStory = await this.svIntent.getWelcomeIntent();

      if (!defaultStory) {
        this.kites.logger.error('No default story: ' + this.svIntent.DefaultWelcome);
        throw new Error('Story: ' + input);
      }

      const result = body;
      result.input = input;
      result.complete = true;
      result.intent = {
        name: defaultStory.storyName,
        storyId: defaultStory._id.toString(),
      };
      result.speechResponse = defaultStory.speechResponse;
      return result;
    }

    const intentName = await this.svIntent.predict(input);
    const story = await this.svIntent.findIntent(intentName);

    let responseResult;
    if (complete === false) {
      responseResult = await this.svNLU.buildNonCompleteResponse(story, body);
    } else {
      responseResult = await this.svNLU.buildCompleteResponse(story, body);
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
