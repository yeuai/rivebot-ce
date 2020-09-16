import { Inject, Injectable } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { Types } from 'mongoose';
import { each as forEach, map as arrayMap } from 'lodash';
import { IntentClassifier } from 'api/features';
import { NlpSampleModel, NlpSample, NlpIntent } from 'api/models';
import { SequenceLabelerService } from './core';

/**
 * NLU Service Definition
 */
@Injectable()
class NluService {
  svIntent: IntentClassifier
  svSequenceLabeler: SequenceLabelerService;

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    // private svIntent: IntentClassifier,
  ) {
    this.kites.logger.info('NLU Service is ready!');
    this.svIntent = new IntentClassifier(this.kites);
    this.svSequenceLabeler = new SequenceLabelerService(this.kites);
  }

  /**
   * Use only for test (development)
   */
  async trainIntentDev() {
    const data = await import('./data/story.json');
    const labeledSentences = [];
    const trainLabels = [];
    //
    forEach(data, (story) => {
      forEach(story.labeledSentences, (sent) => {
        labeledSentences.push(sent.data);
        trainLabels.push(story.intentName);
      });
    });

    //
    const trainFeatures = [];
    forEach(labeledSentences, (label) => {
      const lq = label.reduce((sent, token) => sent + ' ' + token[0], '').trim();
      trainFeatures.push(lq);
    });

    // return [trainFeatures, trainLabels];
    return this.svIntent.train(trainFeatures, trainLabels);
  }

  /**
   * Train bot NLU, include: Intent, NER, ...
   * @param botid
   */
  async trainBot(botid: string) {
    const idBot: Types.ObjectId = Types.ObjectId(botid);

    // 01. Preparing dataset
    const vDataSamples = await NlpSampleModel.find({ idBot })
      .populate('intent')
      .populate('entities');
    const trainLabels: string[] = [];
    const trainFeatures: string[] = [];
    const labeledSentences: string[][][] = [];

    // - Intent & NER dataset
    forEach(vDataSamples, (sample) => {
      // const vIntent = sample.intent as NlpIntent;
      // TODO: Check intentName, text and data is not empty
      trainLabels.push(sample.intentName);
      trainFeatures.push(sample.text);
      labeledSentences.push(sample.data);
    });

    // 02. Train intent detection
    this.kites.logger.info(`Preparing to train dataset: (${trainLabels.length}) items`);
    const vObjModel = await this.svIntent.train(trainFeatures, trainLabels);
    this.kites.logger.info(`NLU has trained Intent detection done, bot: ${botid}`);

    // 03. Train NER tagging
    const vBotNerModelFile = await this.svSequenceLabeler.trainStory(labeledSentences, botid);
    this.kites.logger.info(`NLU has trained NER done at: ${vBotNerModelFile}`);

    return vObjModel;
  }

  /**
   * Extract entities from text
   * @param text
   * @param modelFileId
   */
  extractEntities(text: string, modelFileId: string) {
    const sentTokens = this.svSequenceLabeler.tagNer(text, modelFileId);
    const taggedSentence = arrayMap(sentTokens, (tokens) => [tokens[0], tokens[2]]);
    return this.svSequenceLabeler.extractEntities(taggedSentence);
  }
}

/**
 * Exports NLU Service
 */
export {
  NluService,
};
