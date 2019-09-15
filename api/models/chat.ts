import { prop, Typegoose } from '@hasezoey/typegoose';

/**
 * Define user class
 */
class Chat extends Typegoose {
  @prop() from?: string;
  @prop() botId?: string;
  @prop() text?: string;
  @prop() intent?: string;
  @prop() tags?: string[];
  @prop() dateTime?: Date;
}

/**
 * Define chat logs model
 */
const ChatModel = new Chat().getModelForClass(Chat, {
  schemaOptions: {
    timestamps: true,
    collection: 'chat',
  },
});

export {
  Chat,
  ChatModel,
};
