import { Controller, Get, RequestParam, QueryParam, Request, Post, RequestBody } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { UserService } from './user.service';
import { InvitationService } from '../invitation/invitation.service';
import { AuthJwt } from '../../policies/auth';
import { User } from '../../../api/models';

/**
 * User controller
 */
@Controller('/users', AuthJwt.optional())
export class UserController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(UserService)
    private svUser: UserService,
    @Inject(InvitationService)
    private svInvite: InvitationService,
  ) {
    this.kites.logger.debug('Init User controller!');
  }

  @Get('/')
  async list(
    @QueryParam('filter') filter: any,
    @QueryParam('range') range: any,
    @QueryParam('sort') sort: any,
  ) {
    const [from, to] = JSON.parse(range || '[0, 10]');
    const [field, asc] = JSON.parse(sort || `["name", "desc"]`);
    this.kites.logger.info('Get user list: %s', filter);
    const queryFilter = JSON.parse(filter || '{}');
    // console.log(from, to, field, asc, queryFilter);
    const vResult = await this.svUser.getList(queryFilter, from, to - from);
    return vResult;
  }

  @Get('/info')
  admin(
    @Request() req: any,
  ) {
    return `Hello: ` + req.user;
  }

  @Get('/:username')
  details(
    @RequestParam('username') username: string,
  ) {
    return this.svUser.get(username);
  }

  @Post('/')
  async register(
    @RequestBody() body: any,
  ) {
    const { username, password, email } = body;
    if (!email) {
      const message = 'Your email has not invited!';
      return { message };
    } else if (!username) {
      const message = 'Username must not be empty!';
      return { message };
    } else if (!password) {
      const message = 'Password must not be empty!';
      return { message };
    } else {
      const vInvitation = await this.svInvite.getByEmail(email);
      if (vInvitation === null) {
        const message = 'Your email has not invited!';
        return { message };
      } else if ((await this.svUser.getByEmail(email) !== null)) {
        const message = 'Your email has already registered!';
        return { message };
      } else {
        const user = new User();
        user.username = username;
        user.password = password;
        user.email = email;
        const message = 'Your register has done!';
        const vResult = await this.svUser.create(user);
        const uid = vResult.id;
        return { message, username, uid };
      }
    }
  }

}
