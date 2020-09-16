import { Injectable, Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { UserService } from '../index';

import { BotInterface, BotInterfaceModel, BotAgentModel } from '../../models';

@Injectable()
export class BotInterfaceService {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(UserService)
    private svUser: UserService,
  ) {
    this.kites.logger.info('Init BotInterface Service!');

  }

  /**
   * Create an agent bot
   * @param data
   */
  async create(
    idBot: string,
    idCreator: string,
    botInterface: BotInterface,
  ) {
    await this.svUser.testUserIsActive(idCreator);
    const vBot = await BotAgentModel.findOne({ _id: idBot, active: true, idCreator });
    try {
      botInterface.bot = vBot;
      const vResult = await BotInterfaceModel.create([botInterface]);
      this.kites.logger.info('Create bot interface ok: ' + botInterface.provider);
      return vResult.find(() => true);
    } catch (error) {
      console.error('ERROR', error);
      throw error;
    }
  }

  /**
   * Get list user bot
   * @param domain
   */
  async getList(
    filter: any,
    pageIndex: number = 0,
    pageSize: number = 50,
  ) {
    return BotInterfaceModel.find(filter).skip(pageIndex * pageSize).limit(pageSize);
  }

  /**
   * Get bot interface by provider
   * @param provider
   * @param propFilters
   */
  async getByProvider(provider: string, propFilters?: any) {
    return BotInterfaceModel.findOne({ provider, ...propFilters });
  }

  /**
   * Tun off by inactive it
   * @param name
   * @param domain
   */
  setInActive(provider: string, bot: string) {
    return BotInterfaceModel.findOneAndUpdate({
      provider, bot, active: true,
    }, {
      active: false,
    });
  }

  /**
   * Update bot details
   * @param id
   * @param data
   */
  async createOrUpdate(provider: string, idBot: string, idCreator: string, data: any) {
    let vBotInterface = await this.getByProvider(provider, { bot: idBot });
    if (!vBotInterface) {
      // create new
      vBotInterface = await this.create(idBot, idCreator, {
        provider,
        accessToken: data.accessToken,
      });
    } else {
      // update
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          vBotInterface[key] = data[key];
        }
      }
    }
    return await vBotInterface.save();
  }

}
