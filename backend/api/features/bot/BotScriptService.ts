import { Injectable, Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { BotAgentModel, BotScriptModel, BotScript } from '../../models';

@Injectable()
export class BotScriptService {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
  ) {
    this.kites.logger.info('Init BotScript Service!');
  }

  /**
   * Create bot scripts
   * @param data
   */
  async create(
    idBot: string,
    idCreator: string,
    scripts: BotScript[],
  ) {
    const vBot = await BotAgentModel.findOne({
      _id: idBot,
      idCreator,
    });

    if (!vBot) {
      throw new Error('No bot found: ' + idBot);
    }

    try {
      if (scripts && scripts.length > 0) {
        const botScripts = scripts.map(x => {
          x.bot = vBot.id;
          return x;
        });
        await BotScriptModel.create(botScripts);
        this.kites.logger.info('Create bot scripts ok: ' + idBot);

      } else {
        this.kites.logger.info('No scripts created: ' + idBot);
      }
      return scripts;
    } catch (error) {
      this.kites.logger.error(error);
    }
    return [];
  }

  /**
   * Get list bot scripts
   * @param domain
   */
  async getList(
    filter: any,
    pageIndex: number = 0,
    pageSize: number = 50,
  ) {
    return BotScriptModel.find(filter).skip(pageIndex * pageSize).limit(pageSize);
  }

  /**
   * Get by topic
   * @param topic
   * @param bot
   */
  async getByTopic(topic: string, bot: string) {
    return BotScriptModel.find({ bot, topic, active: true });
  }

  /**
   * Get by id
   * @param id
   * @param propFilters add more filter
   */
  async getById(id: string, propFilters?: any) {
    return BotScriptModel.findOne({ _id: id, active: true, ...propFilters });
  }

  /**
   * Tun off by inactive it
   * @param name
   * @param domain
   */
  setInActive(name: string, domain: string) {
    return BotScriptModel.findOneAndUpdate({
      domain,
      ma: name,
      active: true,
    }, {
      active: false,
    });
  }

  /**
   * Delete bot script by id
   * @param name
   * @param domain
   */
  removeById(id: string) {
    return BotScriptModel.findByIdAndRemove(id);
  }

  /**
   * Update bot scripts
   * @param id
   * @param data
   */
  async update(id: string, idCreator: string, idBot: string, data: any) {
    // ensure user have owned their bot
    const vUserBot = await BotAgentModel.findOne({
      _id: idBot,
      idCreator,
    });

    if (!vUserBot) {
      throw new Error(`User bot not found ${idBot}, creator ${idCreator}`);
    }

    this.kites.logger.info(`Update script: ${id}, creator=${idCreator}, bot=${idBot}`);

    // get bot script by id
    const vBotScript = await BotScriptModel.findOne({
      _id: id,
      bot: idBot,
    });

    if (!vBotScript) {
      this.kites.logger.info('No bot scripts updated!');
      return data;
    }

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        vBotScript[key] = data[key];
      }
    }
    return await vBotScript.save();
  }

}
