import { Inject } from '@kites/common';
import { KitesInstance, KITES_INSTANCE } from '@kites/core';
import { Controller, Post, RequestBody } from '@kites/rest';
import { UserService } from '../user/user.service';

/**
 * Account controller
 */
@Controller('/account')
export class AccountController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(UserService)
    private svUser: UserService,
  ) {
    this.kites.logger.debug('Init User controller!');
  }

  @Post('/authenticate')
  async login(
    @RequestBody() body: any,
  ) {
    const { username, password } = body;
    const vToken = this.svUser.getAuthToken(username, password);
    return vToken;
  }

}
