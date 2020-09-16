import { prop, Ref, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';
import { BotAgent } from './BotAgent';

/**
 * Bot scripts
 */
@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
class BotScript {
  @prop({ uppercase: true })
  topic!: string;

  @prop()
  content!: string;

  @prop({ required: true, ref: 'BotAgent' })
  bot?: Ref<BotAgent>;

  @prop({
    required: false,
    default: false,
  })
  isBuild?: boolean;

  @prop({
    required: false,
    default: true,
  })
  isDraft?: boolean;

  /**
   * TODO: Save pre-build and cache context parsed from content
   */
  @prop({
    required: false,
  })
  preBuild?: object;

}

/**
 * Model definition
 */
const BotScriptModel = getModelForClass(BotScript, {

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
  BotScript,
  BotScriptModel,
};
