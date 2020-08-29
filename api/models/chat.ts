import { getModelForClass, prop, arrayProp, Ref } from '@typegoose/typegoose';

/**
 * Define user class
 */
class Chat {
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
const ChatModel = getModelForClass(Chat, {
  schemaOptions: {
    timestamps: true,
    collection: 'chat',
  },
});

export {
  Chat,
  ChatModel,
};
