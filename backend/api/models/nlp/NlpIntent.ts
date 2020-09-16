import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { User } from '../index';

/**
 * Nlp Intent - The objects that bot recognizes
 */
class NlpIntent {
  @prop({
    required: true,
  })
  name!: string;

  @prop({
    required: true,
  })
  description!: string;

  @prop({
    default: true,
  })
  active!: boolean;

  /**
   * System intent has idBot which equals to null
   */
  @prop({
    required: false,
  })
  idBot?: Types.ObjectId;

  /**
   * System intent has idCreator which equals to null
   */
  @prop({
    required: false,
  })
  idCreator?: Types.ObjectId;

  @prop({
    ref: 'User',
    required: true,
    foreignField: '_id',
    localField: 'idCreator',
    justOne: true,
  })
  public creator: Ref<User>;
}

/**
 * Model definition
 */
const NlpIntentModel = getModelForClass(NlpIntent, {

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
  NlpIntent,
  NlpIntentModel,
};
