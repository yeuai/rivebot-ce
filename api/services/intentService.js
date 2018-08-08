const _ = require('lodash');
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

    /**
     * Lấy toàn bộ dữ liệu huấn luyện
     * TODO: Filter data by domain
     */
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

module.exports = IntentService;
