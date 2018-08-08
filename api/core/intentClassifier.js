'use strict';
const _ = require('lodash');
const fs = require('fs');
const config = require('config');
const vntk = require('vntk');

const sentenceClassifer = new vntk.FastTextClassifier();

class IntentClassifier {
    constructor() {
        this.INTENT_MODEL_NAME = `${config.get('modelConfig.MODELS_DIR')}/${config.get('modelConfig.INTENT_MODEL_NAME')}`
        this.TRAIN_DATA_NAME = `${config.get('modelConfig.MODELS_DIR')}/${config.get('modelConfig.TRAIN_DATA_NAME')}`

        let modelBin = this.INTENT_MODEL_NAME + '.bin';
        if (fs.existsSync(modelBin)) {
            console.log('Load pre-trained model: ' + modelBin)
            sentenceClassifer.loadModel(modelBin)
                .then((res) => {
                    console.log('Load pre-trained model ok!');
                })
        }
    }

    train(trainFeatures, trainLabels) {
        return new Promise((resolve, reject) => {
            // write data to files
            var file = fs.createWriteStream(this.TRAIN_DATA_NAME);
            file.on('error', function (err) {
                return reject(err)
            });
            trainFeatures.forEach(function (v, i) {
                file.write(`__label__${trainLabels[i]} ${v}\n`);
            });
            file.end()

            // feed to trainer
            sentenceClassifer.train('supervised', {
                    input: this.TRAIN_DATA_NAME,
                    output: this.INTENT_MODEL_NAME,
                    dim: 100,
                    loss: 'ns',
                    bucket: 2000000,
                    lr: 0.075,
                    epoch: 1000
                })
                .then((result) => {
                    console.log('model info after training:', result);
                    resolve(result);
                })
                .catch((err) => {
                    console.error('sentenceClassifer train error:', err);
                    reject(err);
                })
        })
    }

    predict(text) {
        return sentenceClassifer.predict(text, 3)
            .then((res) => {
                console.log('sentenceClassifer predict: ', res)
                if (res.length > 0) {
                    return res[0].label.replace(/^__label__/, '')
                } else {
                    return false
                }
            })
    }

}

module.exports = IntentClassifier;
