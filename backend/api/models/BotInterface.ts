import { prop, Ref, getModelForClass } from '@typegoose/typegoose';
import { BotAgent } from './BotAgent';

/**
 * Bot interfaces
 */
class BotInterface {
  @prop({ required: true })
  provider!: string;

  /**
   * API Token
   */
  @prop()
  accessToken!: string;

  @prop({ required: true, ref: 'BotAgent' })
  bot?: Ref<BotAgent>;

  @prop({
    required: true,
    default: true,
  })
  active?: boolean;

}

/**
 * Model definition
 */
const BotInterfaceModel = getModelForClass(BotInterface, {

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
  BotInterface,
  BotInterfaceModel,
};
