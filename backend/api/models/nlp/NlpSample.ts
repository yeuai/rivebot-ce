import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { User, Message } from '../index';
import { NlpEntity } from './NlpEntity';
import { NlpIntent } from './NlpIntent';

/**
 * Nlp Data sample
 */
class NlpSample {
  @prop({
    required: true,
  })
  text!: string;

  @prop({
    required: true,
  })
  data!: string[][];

  @prop({
    required: false,
  })
  idMessage?: Types.ObjectId;

  @prop({
    required: false,
  })
  idIntent?: Types.ObjectId;

  @prop({
    required: false,
  })
  /**
   * Use only for reference (readonly)
   */
  intentName?: string;

  @prop({
    ref: 'Message',
    foreignField: 'bot',
    localField: '_id',
  })
  messages: Array<Ref<Message>>;

  @prop({
    ref: 'NlpEntity',
    foreignField: 'bot',
    localField: '_id',
  })
  entities: Array<Ref<NlpEntity>>;

  @prop({
    default: true,
  })
  active!: boolean;

  @prop({
    required: false,
  })
  idCreator?: Types.ObjectId;

  /**
   * System data link to bot: default
   */
  @prop({
    required: false,
  })
  idBot: Types.ObjectId;

  @prop({
    ref: 'User',
    required: true,
    foreignField: '_id',
    localField: 'idCreator',
    justOne: true,
  })
  public creator: Ref<User>;

  @prop({
    ref: 'NlpIntent',
    foreignField: '_id',
    localField: 'idIntent',
    justOne: true,
  })
  public intent: Ref<NlpIntent>;
}

/**
 * Model definition
 */
const NlpSampleModel = getModelForClass(NlpSample, {

  schemaOptions: {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
});

export {
  NlpSample,
  NlpSampleModel,
};
