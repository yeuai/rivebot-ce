import { Injectable, Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { MessageModel, Message, FilterNormalizer } from '../../models';

/**
 * Message Logs Service
 */
@Injectable()
export class MessageService {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
  ) {
    this.kites.logger.info('Init MessageLog Service!');
  }

  /**
   * Create an active bot
   * @param data
   */
  create(data: Message) {
    return MessageModel.create([data]);
  }

  async getList(
    filter: object,
    pageIndex: number = 0,
    pageSize: number = 50,
  ) {
    // this.kites.logger.info('Get message logs: ' + filter);
    // const vUser = await UserModel.findOne({ username: creator });
    // const query = { idCreator: vUser.id, name };
    // if (!name) {
    //   delete query.name;
    // }
    return MessageModel.find(
      FilterNormalizer.from(filter).normalize().filter,
    ).skip(pageIndex * pageSize).limit(pageSize);
  }

  /**
   * Get by id
   * @param id
   */
  async getById(id: string) {
    return MessageModel.findOne({ _id: id, active: true });
  }

  /**
   * Tun off by inactive it
   * @param name
   * @param domain
   */
  setInActive(id: string, botId: string) {
    return MessageModel.findOneAndUpdate({
      _id: id,
      bot: botId,
      active: true,
    }, {
      active: false,
    });
  }

}
