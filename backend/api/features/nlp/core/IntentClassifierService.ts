import { Injectable, Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import * as fs from 'fs';
import * as _ from 'lodash';

import { Classifier } from 'fasttext';
const sentenceClassifer = new Classifier();

@Injectable()
class IntentClassifier {
  INTENT_MODEL_NAME: string;
  TRAIN_DATA_NAME: string;

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
  ) {
    try {
      this.INTENT_MODEL_NAME = `${this.kites.options.modelConfig.MODELS_DIR}/${this.kites.options.modelConfig.INTENT_MODEL_NAME}`;
      this.TRAIN_DATA_NAME = `${this.kites.options.modelConfig.MODELS_DIR}/${this.kites.options.modelConfig.TRAIN_DATA_NAME}`;

      const modelBin = this.INTENT_MODEL_NAME + '.bin';
      if (fs.existsSync(modelBin)) {
        this.kites.logger.info('Load pre-trained model: ' + modelBin);
        sentenceClassifer.loadModel(modelBin)
          .then((res) => {
            this.kites.logger.info('Load pre-trained model ok!');
          });
      }
    } catch (error) {
      this.kites.logger.error('Cannot load pre-trained model!');
    }
  }

  async train(trainFeatures: string[], trainLabels: string[]) {
    const task = new Promise((resolve, reject) => {
      // write data to files
      const file = fs.createWriteStream(this.TRAIN_DATA_NAME);
      file.on('error', (err) => {
        return reject(err);
      });
      trainFeatures.forEach((v, i) => {
        file.write(`__label__${trainLabels[i]} ${v}\n`);
      });
      file.end();
      resolve(this.TRAIN_DATA_NAME);
    });

    await task;

    // feed to trainer
    const options: any = {
      input: this.TRAIN_DATA_NAME,
      output: this.INTENT_MODEL_NAME,
      dim: 100,
      loss: 'ns',
      bucket: 2000000,
      lr: 0.075,
      epoch: 1000,
    };

    const result = await sentenceClassifer.train('supervised', options)
    this.kites.logger.info(`model info after training: ${result}`);
    return result;
  }

  predict(text) {
    return sentenceClassifer.predict(text, 3)
      .then((res) => {
        this.kites.logger.info('sentenceClassifer predict: ' + res);
        if (res.length > 0) {
          return res[0].label.replace(/^__label__/, '');
        } else {
          return false;
        }
      });
  }

  async predictFromModel(text: string, modelFile: string) {
    // const sentenceClassifer = new Classifier();
    const vModelInfo = await sentenceClassifer.loadModel(modelFile);
    this.kites.logger.info('Load pre-trained model ok: ' + modelFile);
    const vResult = await sentenceClassifer.predict(text, 2);
    if (vResult.length > 0) {
      return vResult[0].label.replace(/^__label__/, '');
    } else {
      return false;
    }
  }

}

export {
  IntentClassifier,
};
