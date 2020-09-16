import { Controller, Get, Put, Request, QueryParam, RequestParam, Delete, Post, RequestBody } from '@kites/rest';
import { InvitationService } from './invitation.service';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { AuthJwt } from '../../policies/auth';
import { Invitation } from '../../models';

@Controller('/invite', AuthJwt.required())
export class InvitationController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(InvitationService)
    private svInvitation: InvitationService,
  ) { }

  @Get('/')
  async list(
    @QueryParam('filter') filter: any,
    @QueryParam('range') range: any,
    @QueryParam('sort') sort: any,
  ) {
    const [from, to] = JSON.parse(range || '[0, 10]');
    const [field, asc] = JSON.parse(sort || `["name", "desc"]`);
    this.kites.logger.info('Get user invitation: %s', filter);
    const queryFilter = JSON.parse(filter || '{}');

    const vResult = await this.svInvitation.getList(queryFilter, from, to - from);
    return vResult;
  }

  @Post('/')
  async create(
    @Request() req: any,
    @RequestBody() body) {
    const { id: idCreator, user: username } = req.user;

    // create new invitation
    const { email } = body;
    const vInvitation = new Invitation();
    vInvitation.email = email;
    vInvitation.idCreator = idCreator;
    if (username !== 'admin') {
      // check limit invitation 5 per account
      const vCount = await this.svInvitation.countByUser(idCreator);
      if (vCount > 5) {
        throw new Error('Sorry. You have only 5 invitations!');
      }
    }

    if ((await this.svInvitation.getByEmail(email)) !== null) {
      this.kites.logger.info('Email already sent: ' + email);
      return 'Already sent: ' + email;
    }

    await this.svInvitation.create(vInvitation);
    return 'Ok';
  }

}
