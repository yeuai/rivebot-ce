import { Injectable, Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as vntk from 'vntk';
import { Trainer, Tagger } from 'crfsuite';
import { IobParser } from './IobParser';
import { WordFeatures } from './WordFeatures';
import { IobEntity } from 'api/features/nlp/core/IobEntity';

/**
 * Trainer engine for @vntk/tagger
 */
@Injectable()
class SequenceLabelerService {
  options: any;
  trainer: Trainer;
  tagger: Tagger;
  iobParser: IobParser;
  features: WordFeatures;

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
  ) {
    try {

      this.options = Object.assign({
        c1: 1.0, // coefficient for L1 penalty
        c2: 1e-3, // coefficient for L2 penalty
        max_iterations: 300,
        // include transitions that are possible, but not observed
        feature_possible_transitions: 1,
      }, this.kites.options.crfConfig);

      if (this.kites.options.modelConfig) {
        this.options.modelFileDir = this.kites.options.modelConfig.MODELS_DIR;
      } else {
        this.options.modelFileDir = this.kites.options.appDirectory + '/_models';
      }

      this.iobParser = new IobParser();
      this.features = new WordFeatures();
      this.trainer = new Trainer();

      this.trainer.set_params({
        'c1': this.options.c1,
        'c2': this.options.c2,
        'max_iterations': this.options.max_iterations,
        'feature.possible_transitions': this.options.feature_possible_transitions,
      });
    } catch (err) {
      this.kites.logger.error(`Can't init trainer:`, err);
      throw err;
    }
  }

  /**
   * features template
   */
  get template() {
    return [
      'T[-2].lower', 'T[-1].lower', 'T[0].lower', 'T[1].lower', 'T[2].lower',
      'T[0].istitle', 'T[-1].istitle', 'T[1].istitle', 'T[-2].istitle', 'T[2].istitle',
      // # word unigram and bigram
      'T[-2]', 'T[-1]', 'T[0]', 'T[1]', 'T[2]',
      'T[-2,-1]', 'T[-1,0]', 'T[0,1]', 'T[1,2]',
      // # pos unigram and bigram
      'T[-2][1]', 'T[-1][1]', 'T[0][1]', 'T[1][1]', 'T[2][1]',
      'T[-2,-1][1]', 'T[-1,0][1]', 'T[0,1][1]', 'T[1,2][1]',
      // # ner
      // 'T[-3][2]', 'T[-2][2]', 'T[-1][2]',
    ];
  }

  /**
   * load files and feed data to the trainer
   * @param {array} files string or array of filename
   */
  loadFiles(...files) {
    if (files && files.length > 0) {
      let i = 0;
      for (const fn of files) {
        console.log(`Parsing file [${i++}](${fn})`);
        const sents = this.iobParser.fromFile(fn);
        sents.forEach((sent, index) => {
          console.log(`Feeding trainer, file [${i}] sent: `, index);
          const X_train = this.transform(sent);
          const y_train = this.features.sent2labels(sent);
          this.trainer.append(X_train, y_train);
        });

      }
    }
  }

  /**
   * transform sentence to features
   * @param {array} tokens array of word tokens
   */
  transform(tokens: string[][]) {
    return tokens.map((token, i) => this.features.word2features(tokens, i, this.template));
  }

  /**
   * Start training
   * @param {string} fn filename
   */
  train(fn) {
    const model_filename = path.resolve(fn || path.join(process.cwd(), './model.bin'));
    console.log('Start training ...');

    this.trainer.train(model_filename);
    console.log('Training done!, saved model to', model_filename);

    // write training info to text
    console.log('Training with info: ', this.options);
  }

  trainStory(labeledSentences: string[][][], botId: string) {
    _.each(labeledSentences, (sent, index) => {
      console.log(`Feeding trainer, sent: `, index, sent);
      const X_train = this.transform(sent);
      const y_train = this.features.sent2labels(sent, 2);
      this.trainer.append(X_train, y_train);
    });

    const model_filename = path.resolve(path.join(process.cwd(), `./model_files/${botId}.model`));
    const iobOutputFileName = path.resolve(path.join(process.cwd(), `./model_files/${botId}.conll`));
    this.kites.logger.info(`
        Start training ...
        ------------------
        > Trainset: ${iobOutputFileName}
        > Output: ${model_filename}
        `);

    // saving iob for testing
    this.iobParser.saveFile(labeledSentences, iobOutputFileName);
    this.trainer.train(model_filename);
    this.kites.logger.info('Training done!, saved model to: ' + model_filename);

    // write training info to text
    this.kites.logger.info('Training with info: ', this.options);
    return Promise.resolve(model_filename);
  }

  /**
   * Tag ner from pre-trained model or get default tags
   * @param sentence
   * @param modelFileId
   */
  tagNer(sentence: string, modelFileId?: string): string[][] {
    const modelFileName = path.resolve(this.options.modelFileDir, `${modelFileId}.model`);
    if (!sentence) {
      this.kites.logger.debug('Tag ner: Sentence must be not empty!');
      return [];
    } else if (!modelFileId || !fs.existsSync(modelFileName)) {
      this.kites.logger.debug('Tag ner from default pre-trained model!');
      const tags = vntk.ner().tag(sentence) as string[];
      const zipTokens = tags.map((tagged) => [tagged[0], tagged[1], tagged[3]]);
      return zipTokens;
    } else {
      const tagger = new Tagger();

      if (tagger.open(modelFileName)) {
        this.kites.logger.debug('Tag ner from pre-trained model: ' + modelFileId);
        const posTags = vntk.posTag().tag(sentence) as any; // string[][];
        const feats = posTags.map((token, i) => this.features.word2features(posTags, i, this.template));
        const nerTags = tagger.tag(feats);
        const zipTokens = posTags.map((tagged, i) => [tagged[0], tagged[1], nerTags[i]]);
        return zipTokens;
      } else {
        throw new Error('Cannot open model file: ' + modelFileId);
      }
    }
  }

  /**
   * Predict ner with extract entities by model file id
   * @param sentence
   * @param modelFileId
   */
  predictNer(sentence: string, modelFileId: string) {
    const tokens = this.tagNer(sentence, modelFileId).map((tagged) => [tagged[0], tagged[2]]);
    return this.extractEntities(tokens);
  }

  extractEntities(taggedSentence: string[][]) {
    const entities = this.iobParser.matchEntities(taggedSentence);
    return entities.map((info) => {
      const entity: IobEntity = {
        name: info[1],
        value: info[4],
        text: info[4],
        start: info[2],
        end: info[3],
      };
      return entity;
    });
  }

}

export {
  SequenceLabelerService,
};
