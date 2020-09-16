import { Inject, Injectable } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { SequenceLabelerService, IobParser } from './core';
import { NlpSample, NlpSampleModel } from 'api/models/nlp';
import * as vntk from 'vntk';
import * as _ from 'lodash';

const posTagger = vntk.posTag();
const tokenizer = vntk.wordTokenizer();

/**
 * NLP Service Definition
 */
@Injectable()
export class NlpService {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(SequenceLabelerService)
    private svSequenceLabeler: SequenceLabelerService,
  ) {
    this.kites.logger.info('Init NLP service!');
  }

  trainStory(idBot: string) {
    return NlpSampleModel.find({ idBot })
      .select('data')
      .then((samples) => {
        if (!samples) { return Promise.reject('Not found data samples: ' + idBot); }
        const data = _.map(samples, (sample) => sample.data);
        return this.svSequenceLabeler.trainStory(data, idBot);
      });
  }

  /**
   * Tag ner
   * @param sentence
   * @param modelFileId
   */
  tagNer(sentence: string, modelFileId?: string) {
    return this.svSequenceLabeler.tagNer(sentence, modelFileId);
  }

  /**
   * Predict ner with extract entities by model file id
   * @param sentence
   * @param modelFileId
   */
  predict(sentence: string, modelFileId?: string) {
    return this.svSequenceLabeler.predictNer(sentence, modelFileId);
  }

  /**
   * Tag pos
   * @param text
   * @param modelFileId - tag by custom model
   */
  tagPos(text: string, modelFileId?: string) {
    // TODO: load custom model from `modelFileId`
    const tags = posTagger.tag(text); // .map((tokens) => [tokens[0], tokens[1], 'O']);
    return tags;
  }

  /**
   * Word tokenizer
   * @param text
   */
  word_tokenize(text: string) {
    const tokens = tokenizer.tag(text);
    return tokens;
  }

}
