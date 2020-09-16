import { Injectable, Inject } from '@kites/common';
import { UserModel, User, FilterNormalizer } from '../../models';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

@Injectable()
export class UserService {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
  ) { }

  async getList(filter: any, from: number, to: number) {

    const vUsers = await UserModel.find(
      FilterNormalizer.from(filter).normalize().filter,
    ); // .skip(0).limit(10);
    return vUsers;
  }

  async create(user: User) {
    if (!user || !user.username) {
      throw new Error('User is required: username!');
    } else if ((await UserModel.findOne({username: user.username})) !== null) {
      throw new Error(`User already registered: ${user.username}!`);
    }
    this.kites.logger.info('Create new user: ' + user.username);
    return UserModel.create(user);
  }

  async get(username: string) {
    this.kites.logger.info('Get details: ' + username);
    const user = await UserModel.findOne({ username });
    this.kites.logger.debug('User not found: ' + username);

    return user;
  }

  /**
   * Get User by id
   * @param _id
   */
  async getById(_id: string) {
    const vResult = await UserModel.findOne({ _id, active: true });
    return vResult;
  }

  /**
   * Get User by email
   * @param email
   */
  async getByEmail(email: string) {
    const vResult = await UserModel.findOne({ email, active: true });
    return vResult;
  }

  async testUserIsActive(_id: string) {
    const vResult = await UserModel.findOne({ _id, active: true });
    if (!vResult) {
      throw new Error('User is not registered!');
    } else if (!vResult.active) {
      throw new Error('User is not active!');
    }
  }

  /**
   * Get authentication token
   * @param username
   * @param password
   */
  async getAuthToken(username: string, password: string) {
    const vUserLogin = await this.get(username);
    if (!vUserLogin) {
      throw new Error('Login fail!');
    }

    const vIsVerified = await vUserLogin.validatePassword(password);
    if (vIsVerified === true) {
      const vToken = vUserLogin.toAuthJson(this.kites.options.jwtSecret);
      return vToken;
    } else {
      throw new Error('Login verify fail!');
    }
  }

  public update(user: string) {
    return `Update: ${user}`;
  }

  public delete(user: string) {
    return `Delete user "${user}"!`;
  }
}
