import { Inject, Injectable } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { Story, StoryModel } from '../models';
import { NerService } from './ner.service';

/**
 * NLU Service Definition
 */
@Injectable()
class NLUService {

  constructor(
    @Inject(KITES_INSTANCE) private kites: KitesInstance,
    private svNER: NerService,
  ) {
    this.kites.logger.info('NLU Service is ready!');
  }

  /**
   * Khởi tạo một câu chuyện mới
   * Thiết lập các trạng thái ban đầu
   * @param {Object} story
   * @param {Request} req
   */
  buildCompleteResponse(story, body) {
    const result = body;
    const input = body.input;
    let parameters = [];
    if (!story) {
      throw new Error('Not found story: ' + input);
    }
    if (story.parameters) {
      parameters = story.parameters;
    }

    // check fulfill is complete
    result.missingParameters = [];
    result.extractedParameters = {};
    result.parameters = [];
    result.input = input;
    // result['complete'] = false

    const storyId = story._id.toString();
    result.intent = {
      name: story.intentName,
      storyId,
    };
    let extractedParameters = [];
    const missingParameters = [];
    if (parameters.length > 0) {
      extractedParameters = this.svNER.predict(storyId, input);
      this.kites.logger.info('nerService predict: ', extractedParameters);

      // check required parameters
      result.parameters = parameters.map((p) => {
        if (p.required && typeof extractedParameters[p.name] === 'undefined') {
          missingParameters.push(p);
        }

        return {
          name: p.name,
          type: p.type,
          required: p.required,
        };
      });

      result.extractedParameters = extractedParameters;
      result.missingParameters = missingParameters.map((p) => p.name);

      if (missingParameters.length > 0) {
        result.complete = false;
        result.currentNode = missingParameters[0].name;
        result.speechResponse = missingParameters[0].prompt;
      } else {
        result.complete = true;
        result.parameters = extractedParameters;
      }
    } else {
      result.complete = true;
    }
    return Promise.resolve(result);
  }

  /**
   * Trích xuất câu trả lời từ đoạn hội thoại người dùng
   * - Đảm bảo bộ khung các câu hỏi được trả lời (required)
   * - Nếu tất cả các câu hỏi được trả lời -> Hoàn tất đoạn hội thoại, khuyến nghị người dùng bắt đầu một câu chuyện khác
   * @param {Object} story
   * @param {RequestBody} body
   */
  buildNonCompleteResponse(story, body) {
    const result = body;

    if (story.intentName === 'cancel') {
      result.currentNode = '';
      result.missingParameters = [];
      result.parameters = {};
      result.intent = {};
      result.complete = true;
      return Promise.resolve(result);
    } else {
      const storyId = body.intent.storyId;
      let currentNode = body.currentNode;
      const extractedParameters = body.extractedParameters || {};
      const missingParameters = body.missingParameters || [];
      const currentNodeIndex = missingParameters.indexOf(currentNode);
      const currentNodeExtractedParameters = this.svNER.predict(storyId, body.input);

      // Update extracted parameters
      Object.assign(extractedParameters, currentNodeExtractedParameters);

      this.kites.logger.info('storyId: ' + storyId);
      this.kites.logger.info('currentNode: ' + currentNode);
      this.kites.logger.info('extractedParameters: ' + JSON.stringify(extractedParameters));
      // Remove solved current node
      missingParameters.splice(currentNodeIndex, 1);

      if (missingParameters.length > 0) {
        return StoryModel.findById(storyId)
          .lean()
          .then((res: Story) => {
            result.complete = false;
            const missingParameter = missingParameters[0];
            currentNode = res.parameters.filter((p) => p.name === missingParameter)[0];
            result.currentNode = currentNode.name;
            result.speechResponse = currentNode.prompt;
            return result;
          });
      } else {
        result.complete = true;
        result.parameters = extractedParameters;
        return Promise.resolve(result);
      }
    }
  }

}

/**
 * Exports NLU Service
 */
export {
  NLUService,
};
