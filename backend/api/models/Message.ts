// tslint:disable: max-classes-per-file
import { getModelForClass, modelOptions, prop, Ref, Severity } from '@typegoose/typegoose';
import { BotAgent } from './BotAgent';
import { User } from './User';

/**
 * Chat message request context
 */
@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
class RequestContext {

  @prop()
  currentFlow: string;

  @prop()
  currentDialogue: string;

  @prop()
  isFlowing: boolean;

  @prop()
  flows: string[];

  @prop()
  missingFlows: string[];

  @prop()
  variables?: object;

  @prop()
  prompt?: string[];
}

/**
 * Intent detection
 */
class Intent {
  @prop()
  name: string;

  @prop()
  confidence: number;
}

/**
 * Bot Messages history
 */
class Message {
  /**
   * Human message input
   */
  @prop({
    required: true,
  })
  input!: string;

  @prop()
  intent?: Intent[];

  @prop({
    required: true,
  })
  idBot: string;

  @prop({
    default: '',
  })
  speechResponse?: string;

  @prop()
  context: RequestContext;

  @prop({
    default: true,
  })
  active?: boolean;

  /**
   * System user is testing
   * Human is anonymous if idUser is not present
   */
  @prop()
  idUser?: string;

  /**
   * Virtual fields
   */
  @prop({
    ref: 'User',
    foreignField: '_id',
    localField: 'idUser',
    justOne: true,
  })
  tester?: Ref<User>;

  @prop({
    ref: BotAgent,
    foreignField: '_id',
    localField: 'idBot',
    justOne: true,
  })
  bot?: Ref<BotAgent>;
}

/**
 * Model definition
 */
const MessageModel = getModelForClass(Message, {

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
  Message,
  MessageModel,
};
