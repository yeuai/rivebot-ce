import { Inject, Injectable } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { SequenceLabeler } from '../core/sequenceLabeler';
import { Story, StoryModel } from '../models';

/**
 * Ner Service Definition
 */
@Injectable()
class NerService {

  constructor(
    @Inject(KITES_INSTANCE) private kites: KitesInstance,
    private sequenceLabeler: SequenceLabeler,
  ) {
    this.kites.logger.info('Init ner service!');
  }

  trainStory(storyId) {
    return StoryModel.findById(storyId)
      .select('labeledSentences')
      .lean()
      .then((story) => {
        if (!story) { return Promise.reject('not found story: ' + storyId); }
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

export {
  NerService,
};
