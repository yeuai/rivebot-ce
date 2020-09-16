import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { User } from '../index';

enum ExtractMethod {
  Default = 'default',
  Exact = 'exact',
  Predict = 'predict',
}

/**
 * Nlp Entity - The objects that bot recognizes
 */
class NlpEntity {
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

  @prop({
    default: ExtractMethod.Default,
    enum: ExtractMethod,
  })
  extractMethod!: ExtractMethod;

  /**
   * System entity has idBot which equals to null
   */
  @prop({
    required: false,
  })
  idBot?: Types.ObjectId;

  /**
   * System entity has idCreator which equals to null
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
const NlpEntityModel = getModelForClass(NlpEntity, {

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
  NlpEntity,
  NlpEntityModel,
};
