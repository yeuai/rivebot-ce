import { prop, Typegoose, arrayProp, Ref } from '@hasezoey/typegoose';

// class LabeledSentences extends Typegoose {
//   @arrayProp({ items: String }) data: any[];
//   @prop() text: string;
//   @prop() label: string;
// }

/**
 * Define Story class
 * Phôi thiết kế kịch bản nói chuyện với người dùng
 */
class Story extends Typegoose {
  @prop() storyName: string;
  @prop({
    required: true,
    unique: true,
  }) intentName: string;

  @prop() apiTrigger: boolean;
  @prop() apiDetails: {
    url: string,
    requestType: string,
    isJson: boolean,
    jsonData: object,
  };
  @prop() speechResponse: string;
  @prop() parameters: [{
    name: string,
    required: boolean,
    type: string,
    prompt: string,
  }];

  @prop() labeledSentences?: [{
    data: any[];
    text: string;
    label: string;
  }];
}

/**
 * Define story model
 */
const StoryModel = new Story().getModelForClass(Story, {
  schemaOptions: {
    // _id: true,
    timestamps: true,
    collection: 'story',
  },
});

export {
  Story,
  StoryModel,
};
