import { Controller, Get, Put, Request, RequestParam, Delete, Post, RequestBody, QueryParam } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { BotAgentService } from './';
import { AuthJwt } from '../../policies/auth';
import { BotAgent } from '../../models';

@Controller('/bots', AuthJwt.required())
export class BotAgentController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(BotAgentService)
    private svBotAgent: BotAgentService,
  ) { }

  @Get('/', AuthJwt.required())
  async list(
    @Request() req: any,
    @QueryParam('filter') filter: any,
    @QueryParam('range') range: any,
    @QueryParam('sort') sort: any,
  ) {
    const { id, user: username } = req.user;
    const [from, to] = JSON.parse(range || '[0, 10]');
    const [field, asc] = JSON.parse(sort || `["name", "desc"]`);
    const queryFilter = JSON.parse(filter);

    this.kites.logger.info('Get user bot: %s, %s, %s', username, id, filter);
    // const vUser = await this.svUser.get(username);
    // if (!vUser) {
    //   this.kites.logger.info('User is locked or does not exist!');
    // }
    queryFilter.idCreator = id;

    const vResult = await this.svBotAgent.getList(queryFilter, from, to - from);
    return vResult;
  }

  @Get('/:id')
  async details(
    @RequestParam('id') botId,
  ) {
    const vResult = await this.svBotAgent.getById(botId);
    return vResult;
  }

  /**
   * TODO: Refactor & clone bot
   * @param botId
   */
  @Get('/:id/clone')
  async clone(
    @Request() req,
    @RequestParam('id') botId,
  ) {
    const { id: idCreator } = req.user;
    const vResult = await this.svBotAgent.clone(idCreator, botId);
    this.kites.logger.debug('Clone a new bot ok: ' + vResult.name);
    return vResult.toJSON();
  }

  @Post('/', AuthJwt.required())
  async create(
    @Request() req: any,
    @RequestBody() body: any,
  ) {
    const { id } = req.user;
    const { domain, name, note, description } = body;
    this.kites.logger.info('Create a new bot %s from %s', name, req.user.username);
    const vUserBot = new BotAgent();
    vUserBot.name = name;
    vUserBot.domain = domain || 'general';
    vUserBot.idCreator = id;
    vUserBot.note = note;
    vUserBot.description = description;
    const vResult = await this.svBotAgent.create(vUserBot);
    return vResult.find(() => true);
  }

  @Put('/:id')
  async update(
    @Request() req: any,
    @RequestBody() body: any,
    @RequestParam('id') botId: string,
  ) {
    const { idCreator, name, note, description } = body;
    const { id } = req.user;
    if (id === idCreator) {
      this.kites.logger.info('Update bot: %s -> %s', botId, name);
    } else if (id === 'admin') {
      this.kites.logger.info('Admin update bot (forced): %s -> %s', botId, name);
    } else {
      throw new Error('You cannot update bot: ' + name);
    }

    const vResult = await this.svBotAgent.update(botId, idCreator, { name, note, description });
    return vResult;
  }

}
