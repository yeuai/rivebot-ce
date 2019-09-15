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
    private nluService: NLUService,
    private intentClassifier: IntentClassifier,
  ) {

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
        return this.intentClassifier.train(trainFeatures, trainLabels);
      });
  }

  /**
   * Nhận dạng ý định của người dùng
   * Mặc định lấy 3 instance cho việc xử lý đoạn chat ngắn
   * @param {String} text
   */
  predict(text) {
    return this.intentClassifier.predict(text);
  }
}

export {
  IntentService,
};
