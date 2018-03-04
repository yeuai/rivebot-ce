'use strict';
const _ = require('lodash');
const path = require('path');
const crfsuite = require('crfsuite');
const iobParser = require('./iob');
const features = require('./features');
const storyModel = require('../models/story');


/**
 * Trainer engine for @vntk/tagger
 */
class SequenceLabeler {

    constructor(opt) {
        try {

            this.options = Object.assign({
                c1: 1.0, // coefficient for L1 penalty
                c2: 1e-3, // coefficient for L2 penalty
                max_iterations: 300,
                // include transitions that are possible, but not observed
                feature_possible_transitions: 1
            }, opt);


            this.trainer = new crfsuite.Trainer();

            this.trainer.set_params({
                c1: this.options.c1,
                c2: this.options.c2,
                max_iterations: this.options.max_iterations,
                'feature.possible_transitions': this.options.feature_possible_transitions
            });
        } catch (ex) {
            console.error(`Can't init trainer:`, ex);
            throw ex;
        }
    }

    /**
     * features template
     */
    get template() {
        return [
            'T[-2].lower', 'T[-1].lower', 'T[0].lower', 'T[1].lower', 'T[2].lower',
            'T[0].istitle', 'T[-1].istitle', 'T[1].istitle', 'T[-2].istitle', 'T[2].istitle',
            //# word unigram and bigram
            'T[-2]', 'T[-1]', 'T[0]', 'T[1]', 'T[2]',
            'T[-2,-1]', 'T[-1,0]', 'T[0,1]', 'T[1,2]',
            //# pos unigram and bigram
            'T[-2][1]', 'T[-1][1]', 'T[0][1]', 'T[1][1]', 'T[2][1]',
            'T[-2,-1][1]', 'T[-1,0][1]', 'T[0,1][1]', 'T[1,2][1]',
            //# ner
            'T[-3][3]', 'T[-2][3]', 'T[-1][3]',
        ];
    }

    /**
     * load files and feed data to the trainer
     * @param {array} files string or array of filename
     */
    loadFiles(...files) {
        if (files && files.length > 0) {
            let i = 0;
            for (let fn of files) {
                console.log(`Parsing file [${i++}](${fn})`)
                let sents = iobParser.fromFile(fn);
                sents.forEach((sent, index) => {
                    console.log(`Feeding trainer, file [${i}] sent: `, index);
                    let X_train = this.transform(sent);
                    let y_train = features.sent2labels(sent);
                    this.trainer.append(X_train, y_train);
                });

            }
        }
    }

    /**
     * transform sentence to features
     * @param {array} tokens array of word tokens
     */
    transform(tokens) {
        return tokens.map((token, i) => features.word2features(tokens, i, this.template));
    }

    /**
     * Start training
     * @param {string} fn filename
     */
    train(fn) {
        let model_filename = path.resolve(fn || path.join(process.cwd(), './model.bin'))
        console.log('Start training ...');

        this.trainer.train(model_filename);
        console.log('Training done!, saved model to', model_filename);

        // write training info to text
        console.log('Training with info: ', this.options);
    }

    trainStory(storyId) {
        return storyModel.findById(storyId).lean()
            .then((story) => {
                if (!story) return Promise.reject('not found story: ' + storyId``)
                let trainSentences = _.map(story.labeledSentences, (item) => item.data)
                _.each(trainSentences, (sent, index) => {
                    console.log(`Feeding trainer, sent: `, index, sent);
                    let X_train = this.transform(sent);
                    let y_train = features.sent2labels(sent, 2);
                    this.trainer.append(X_train, y_train);
                })

                let model_filename = path.resolve(path.join(process.cwd(), `./model_files/${storyId}.model`))
                console.log('Start training ...');
        
                this.trainer.train(model_filename);
                console.log('Training done!, saved model to', model_filename);
        
                // write training info to text
                console.log('Training with info: ', this.options);
                return model_filename
            })
    }

}

module.exports = SequenceLabeler;