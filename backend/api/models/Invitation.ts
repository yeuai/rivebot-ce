import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { User } from './User';

/**
 * Invitation models for:
 * - User register
 * - Bot moderator
 * - Group administration
 */
class Invitation {
  @prop({
    required: true,
    unique: true
  })
  email!: string;

  @prop({
    required: true,
  })
  idCreator!: string;

  @prop({
    required: true,
    default: false,
  })
  isAccepted?: boolean;

  @prop({
    default: new Date(),
  })
  createdAt?: Date;

  @prop()
  usedAt?: Date;

  @prop({
    default: true,
  })
  active?: boolean;

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
const InvitationModel = getModelForClass(Invitation, {

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
  Invitation,
  InvitationModel,
};
