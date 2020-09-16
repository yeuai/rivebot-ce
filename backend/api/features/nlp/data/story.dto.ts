export interface LabeledSentence {
  _id: string;
  text: string;
  data: string[][];
}
export interface StoryDto {
  '_id': string;
  'storyName': string;
  'intentName': string;
  'apiTrigger': boolean;
  'speechResponse': string;
  'parameters': {
    'type': string;
    'required': boolean;
    'name': string;
    'prompt': string;
  }[];
  'labeledSentences': LabeledSentence[];
}
