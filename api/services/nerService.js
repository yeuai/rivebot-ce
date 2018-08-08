const SequenceLabeler = require('../core/sequenceLabeler');

/**
 * Ner Service Definition
 */
class NerService {

    constructor(kites) {
        // make sure kites is ready
        kites.ready(() => {
            this.storyModel = this.kites.db.story;
            this.nluService = this.kites.sv.nlu;

            this.sequenceLabeler = new SequenceLabeler();
        })
    }

    trainStory(storyId) {
        return this.storyModel.findById(storyId)
            .select('labeledSentences')
            .lean()
            .then((story) => {
                if (!story) return Promise.reject('not found story: ' + storyId);
                return this.sequenceLabeler.trainStory(story, storyId);
            });
    }

    tag(storyId, sentence) {
        return this.sequenceLabeler.tag(storyId, sentence);
    }

    predict(storyId, sentence) {
        return this.sequenceLabeler.predict(storyId, sentence);
    }
}

module.exports = NerService;
