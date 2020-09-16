import { Controller, Get, Put, Request as Req, RequestParam, Delete, Post, RequestBody, QueryParam } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { BotScriptService, BotAgentService } from './';
import { AuthJwt } from '../../policies/auth';

@Controller('/botscripts', AuthJwt.required())
export class BotScriptController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(BotScriptService)
    private svBotScript: BotScriptService,
    @Inject(BotAgentService)
    private svBotAgent: BotAgentService,
  ) { }

  @Get('/')
  async list(
    @Req() req: any,
    @QueryParam('filter') filter: any,
    @QueryParam('range') range: any,
    @QueryParam('sort') sort: any,
  ) {
    const userRequest = req.user || {};
    const { id: idCreator, user: username } = userRequest;
    const [from, to] = JSON.parse(range || '[0, 10]');
    const [field, asc] = JSON.parse(sort || `["name", "desc"]`);
    const queryFilter = JSON.parse(filter);

    // filter
    const { bot: botId } = queryFilter;

    this.kites.logger.info('Get user bot scripts: %s, %s, %s', username, idCreator, filter);
    const vUserBot = await this.svBotAgent.getBotScripts(botId, idCreator);

    if (!vUserBot) {
      throw new Error(`User ${username} does not have bot id ${botId}`);
    }

    return vUserBot.scripts;
  }

  @Post('/')
  async create(
    @Req() req: any,
    @RequestBody() body: any,
  ) {
    const { id: idCreator, user: username } = req.user;

    // data
    const { botId, topic, content } = body;

    this.kites.logger.info('Create new bot scripts: %s, %s', username, botId);
    const vBotScript = await this.svBotScript.create(botId, idCreator, [{ topic, content }]);
    return vBotScript;
  }

  @Get('/:id')
  async details(
    @RequestParam('id') botScriptId,
  ) {
    const vResult = await this.svBotScript.getById(botScriptId);
    return vResult;
  }

  @Delete('/:id')
  async remove(
    @RequestParam('id') botScriptId: string,
  ) {
    const vResult = await this.svBotScript.removeById(botScriptId)
    return vResult;
  }

  /**
   * Update bot script data
   * @param botId
   */
  @Put('/:id')
  async update(
    @Req() req: any,
    @RequestParam('id') idScript,
    @RequestBody() body,
  ) {
    const { id: idCreator } = req.user;
    const { bot: idBot, content } = body;

    const vResult = await this.svBotScript.update(
      idScript,
      idCreator,
      idBot,
      {
        content,
      },
    );
    return vResult;
  }

}
