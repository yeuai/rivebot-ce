import { Inject, Injectable } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import * as _ from 'lodash';

import { NLUService } from './nlu.service';
import { Story, StoryModel } from '../models';
import { IntentClassifier } from '../core/intent-classifier';

/**
 * Intent Service Definition
 */
@Injectable()
class IntentService {

  constructor(
    @Inject(KITES_INSTANCE) private kites: KitesInstance,
    private svIntentClassifier: IntentClassifier,
  ) {
  }

  /**
   * Get Default fallback intent name
   */
  get DefaultFallback() {
    return this.kites.options.modelConfig.DEFAULT_FALLBACK_INTENT_NAME;
  }

  /**
   * Get default welcome intent name
   */
  get DefaultWelcome() {
    return this.kites.options.modelConfig.DEFAULT_WELCOME_INTENT_NAME;
  }

  /**
   * Lấy toàn bộ dữ liệu huấn luyện
   * TODO: Filter data by domain
   */
  getData() {
    return new Promise((resolve, reject) => {
      StoryModel.find({})
        .lean()
        .then((stories) => {
          resolve(stories);
        })
        .catch(reject);
    })
      .then(stories => {
        const labeledSentences = [];
        const trainLabels = [];
        //
        _.each(stories, (story) => {
          _.each(story.labeledSentences, (sent) => {
            labeledSentences.push(sent.data);
            trainLabels.push(story.intentName);
          });
        });
        //
        const trainFeatures = [];
        _.each(labeledSentences, (label) => {
          const lq = label.reduce((sent, token) => sent + ' ' + token[0], '').trim();
          trainFeatures.push(lq);
        });
        return [trainFeatures, trainLabels];
      });
  }

  /**
   * Huấn luyện dữ liệu, tạo bộ phân lớp
   * Output là đường dẫn tới file model
   */
  train() {
    return this.getData()
      .then(([trainFeatures, trainLabels]) => {
        return this.svIntentClassifier.train(trainFeatures, trainLabels);
      });
  }

  /**
   * Nhận dạng ý định của người dùng
   * Mặc định lấy 3 instance cho việc xử lý đoạn chat ngắn
   * @param {String} text
   */
  predict(text) {
    return this.svIntentClassifier.predict(text);
  }

  /**
   * Find intent story by name
   * @param intentName intent name
   */
  async findIntent(intentName: string) {
    this.kites.logger.info(`Intent detected: ${intentName || '<empty/>'}`);
    intentName = intentName || this.DefaultFallback;

    this.kites.logger.info('Find intent story: ' + intentName);
    let story = await StoryModel.findOne({ intentName }).lean();
    if (!story) {
      this.kites.logger.info(`Intent story not defined: ${intentName}, get default fallback!`);
      story = await StoryModel.findOne({ intentName: this.DefaultFallback }).lean();
    }
    return story;
  }

  /**
   * Get default welcome intent story
   */
  async getWelcomeIntent() {
    return this.findIntent(this.DefaultWelcome);
  }
}

export {
  IntentService,
};
