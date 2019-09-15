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
    private nerService: NerService,
  ) {
    this.kites.logger.info('NLU Service is ready!');
  }

  /**
   * Xây dựng câu trả lời với trạng thái hoàn tất
   * Người dùng đã nhập đủ thông tin yêu cầu
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
      extractedParameters = this.nerService.predict(storyId, input);
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
   * Xây dựng câu trả lời với trạng thái chưa hoàn tất
   * Chờ người dùng nhập đủ thông tin yêu cầu
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
      let extractedParameters = body.extractedParameters || {};
      const missingParameters = body.missingParameters || [];
      const currentNodeIndex = missingParameters.indexOf(currentNode);

      if (typeof extractedParameters === 'string') {
        extractedParameters = JSON.parse(extractedParameters);
      }
      this.kites.logger.info('storyId: ' + storyId);
      this.kites.logger.info('currentNode: ' + currentNode);
      this.kites.logger.info('extractedParameters: ' + extractedParameters + typeof extractedParameters);
      extractedParameters[currentNode] = body.input;
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
