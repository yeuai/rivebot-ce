import { Injectable, Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { MessageService, UserService } from '../../features';

import { BotAgent, BotAgentModel, UserModel, BotScriptModel, BotScript } from '../../models';

@Injectable()
export class BotAgentService {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(UserService)
    private svUser: UserService,
  ) {
    this.kites.logger.info('Init BotAgent Service!');

  }

  /**
   * Create an agent bot
   * @param data
   */
  async create(
    data: BotAgent,
    scripts?: BotScript[],
  ) {
    await this.svUser.testUserIsActive(data.idCreator);
    const vResult = await BotAgentModel.create([data]);
    try {
      const vBot = vResult.find(x => true);
      if (vResult.length > 0 && (scripts && scripts.length > 0)) {
        const botScripts = scripts.map(x => {
          x.bot = vBot.id;
          return x;
        });
        await BotScriptModel.create(botScripts);
        this.kites.logger.info('Create bot with scripts ok: ' + data.name);

      } else {
        this.kites.logger.info('Create bot ok: ' + data.name);
      }
    } catch (error) {
      console.error('ERROR', error);
    }
    return vResult;
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
    return BotAgentModel.find(filter).skip(pageIndex * pageSize).limit(pageSize);
  }

  /**
   * Get by name
   * @param name
   * @param domain
   */
  async getByName(name: string) {
    return BotAgentModel.findOne({ name, active: true });
  }

  /**
   * Get by id
   * @param id
   * @param propFilters add more filter
   */
  async getById(id: string, propFilters?: any) {
    return BotAgentModel.findOne({ _id: id, active: true, ...propFilters });
  }

  /**
   * Get bot-devel default by name
   * @param id
   */
  async getBotScriptsOrDefault(name: string, idCreator: string) {
    let vBot = await BotAgentModel.findOne({ name, active: true }).populate('scripts');
    if (!vBot) {
      vBot = await BotAgentModel.findOne({ idCreator, active: true }).populate('scripts');
      if (!vBot) {
        throw new Error('Bot not found: ' + name);
      }
    }
    return vBot;
  }

  /**
   * Get bot & scripts
   * @param idBot
   * @param idCreator
   */
  async getBotScripts(idBot: string, idCreator: string) {
    return BotAgentModel.findOne({ _id: idBot, idCreator, active: true }).populate({
      path: 'scripts',
      options: {
        sort: { createdAt: -1 }
      }
    });
  }

  /**
   * Tun off by inactive it
   * @param name
   * @param domain
   */
  setInActive(name: string, domain: string) {
    return BotAgentModel.findOneAndUpdate({
      ma: name, domain, active: true,
    }, {
      active: false,
    });
  }

  /**
   * Update bot details
   * @param id
   * @param data
   */
  async update(id: string, idCreator: string, data: any) {
    const vUserBot = await this.getById(id, { idCreator });
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        vUserBot[key] = data[key];
      }
    }
    return await vUserBot.save();
  }

  /**
   * Clone bot template
   * @param creator id bot creator
   * @param botName new bot name (unique)
   */
  async clone(
    creator: string,
    botName: string,
    botId?: string,
  ) {
    // create default bot
    const util = await import('util');
    const fs = await import('fs');
    const path = await import('path');
    const readFile = util.promisify(fs.readFile);
    const botBrainDirectory = path.join(this.kites.appDirectory, 'bots');
    const general = await readFile(path.join(botBrainDirectory, 'default.bot'), 'utf-8');
    const definition = await readFile(path.join(botBrainDirectory, 'definition.bot'), 'utf-8');
    const survey = await readFile(path.join(botBrainDirectory, 'survey.bot'), 'utf-8');

    const vSmartBot = new BotAgentModel();
    vSmartBot._id = botId;
    vSmartBot.name = botName;
    vSmartBot.domain = 'general';
    vSmartBot.note = 'My first bot!';
    vSmartBot.description = 'This is my smart bot';
    vSmartBot.idCreator = creator;

    const vResult = await this.create(vSmartBot, [
      {
        topic: 'definition',
        content: definition,
      },
      {
        topic: 'general',
        content: general,
      },
      {
        topic: 'survey',
        content: survey,
      },
    ]);
    return vResult.find(() => true);
  }

}
