import { getModelForClass, prop, arrayProp, Ref } from '@typegoose/typegoose';
import { BotScript } from './BotScript';
import { User } from './User';

/**
 * Bot Agent
 */
class BotAgent {
  @prop({
    required: true,
  })
  domain!: string;

  @prop({
    required: true,
    unique: true,
    // validate: /a/
  })
  name!: string;

  @prop({
    ref: 'BotScript',
    foreignField: 'bot',
    localField: '_id',
  })
  scripts: Array<Ref<BotScript>>;

  @prop({
    default: '',
  })
  note?: string;

  @prop({
    default: '',
  })
  description?: string;

  @prop({
    default: 0,
  })
  priority!: number;

  @prop({
    default: true,
  })
  active!: boolean;

  @prop()
  idLoaiTuDien!: string;

  @prop({
    required: true,
  })
  idCreator!: string;

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
const BotAgentModel = getModelForClass(BotAgent, {

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
  BotAgent,
  BotAgentModel,
};
