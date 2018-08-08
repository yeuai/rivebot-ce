const IntentClassifier = require('../core/intentClassifier');

/**
 * Intent Service Definition
 */
class IntentService {

    constructor(kites) {
        // make sure kites is ready
        kites.ready(() => {
            this.storyModel = this.kites.db.story;
            this.nluService = this.kites.sv.nlu;
            this.intentClassifier = new IntentClassifier();
        })
    }


    getData() {
        return new Promise((resolve, reject) => {
                this.storyModel.find({})
                    .lean()
                    .then((stories) => {
                        resolve(stories)
                    })
                    .catch(reject)
            })
            .then(stories => {
                let labeledSentences = []
                let trainLabels = []
                //
                _.each(stories, (story) => {
                    _.each(story.labeledSentences, (sent) => {
                        labeledSentences.push(sent.data)
                        trainLabels.push(story.intentName)
                    })
                })
                //
                let trainFeatures = []
                _.each(labeledSentences, (label) => {
                    let lq = label.reduce((sent, token) => sent + ' ' + token[0], '').trim()
                    trainFeatures.push(lq);
                })
                return [trainFeatures, trainLabels];
            })
    }

    train() {
        return this.getData()
            .then(([trainFeatures, trainLabels]) => {
                return this.intentClassifier.train(trainFeatures, trainLabels);
            });
    }

    predict(text) {
        return this.intentClassifier.predict(text, 3)
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

module.exports = IntentService;
