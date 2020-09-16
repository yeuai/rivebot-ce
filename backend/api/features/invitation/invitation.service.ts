import { Injectable, Inject } from '@kites/common';
import { InvitationModel, Invitation, FilterNormalizer } from '../../models';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

@Injectable()
export class InvitationService {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
  ) { }

  async getList(filter: any, from: number, to: number) {

    const vResult = await InvitationModel.find(
      FilterNormalizer.from(filter).normalize().filter,
    ); // .skip(0).limit(10);
    return vResult;
  }

  create(invite: Invitation) {
    if (!invite || !invite.email) {
      throw new Error('Email is required on an invitation!');
    }
    this.kites.logger.info('Create new invitation: ' + invite.email);
    return InvitationModel.create(invite);
  }

  async getByEmail(email: string) {
    this.kites.logger.info('Get invitation by: ' + email);
    const invitation = await InvitationModel.findOne({ email });

    return invitation;
  }

  /**
   * Invitation count by user
   * @param idCreator
   */
  async countByUser(idCreator: string) {
    const vCount = await InvitationModel.count({ idCreator });
    return vCount;
  }
}
