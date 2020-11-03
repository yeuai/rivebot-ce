import { getModelForClass, prop, DocumentType, pre, Ref } from '@typegoose/typegoose';
import { pbkdf2, randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as util from 'util';
import { BotAgent } from './BotAgent';

const pbkdf2Async = util.promisify(pbkdf2);
const randomBytesAsync = util.promisify(randomBytes);

@pre<User>('save', async function(next) {
  try {
    this.stars = 0;

    if (this.isModified('password') || this.isNew) {
      this.salt = (await randomBytesAsync(16)).toString('hex');
      const hash = await pbkdf2Async(this.password, this.salt, 10000, 512, 'sha512');
      this.password = hash.toString('hex');
    }
    return next();
  } catch (error) {
    return next(error);
  }
})
/**
 * Model definition
 */
class User {

  @prop({
    required: true,
    unique: true,
  })
  username!: string;

  @prop({
    required: true,
    default: 'user',
  })
  name!: string;

  @prop({
    required: true,
    default: 'your-email@example.com',
  })
  email?: string;

  @prop({
    required: false,
    default: '0987654321',
  })
  phone?: string;

  @prop()
  password?: string;

  @prop()
  salt?: string;

  @prop({
    default: 0,
  })
  stars?: number;

  @prop({
    required: false,
    default: 'example.com',
  })
  website?: string;

  @prop({
    required: false,
    default: 'Your Company!',
  })
  company?: string;

  @prop({
    required: false,
  })
  idInvitation?: string;

  @prop({
    required: true,
    default: true,
  })
  active?: boolean;

  @prop({ ref: 'BotAgent' })
  bots: Ref<BotAgent>;

  async validatePassword(password: string): Promise<boolean | Error> {
    const hash = await pbkdf2Async(password, this.salt, 10000, 512, 'sha512');
    return this.password === hash.toString('hex');
  }

  public toAuthJson(this: DocumentType<User>, secret: string) {
    return {
      id: this._id,
      username: this.username,
      access_token: this.generateToken(secret),
    };
  }

  public generateToken(this: DocumentType<User>, secret: string) {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);
    const permissions = [];
    if (this.username === 'admin') {
      permissions.push('admin');
    }

    return jwt.sign({
      id: this._id,
      user: this.username,
      exp: parseInt(String(expirationDate.getTime() / 1000), 10),
      permissions,
    }, secret);
  }

}

/**
 * Define user model
 */
const UserModel = getModelForClass(User, {
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
  User,
  UserModel,
};
