import { Controller, Get, Put, Request as Req, RequestParam, Delete, Post, RequestBody, QueryParam } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { BotInterfaceService } from './BotInterfaceService';
import { AuthJwt } from '../../policies/auth';
import { BotAgent } from '../../models';

@Controller('/interfaces', AuthJwt.required())
export class BotInterfaceController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(BotInterfaceService)
    private svBotInterface: BotInterfaceService,
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
    const { bot } = queryFilter;

    this.kites.logger.info('Get user bot interfaces: %s, %s, %s', username, idCreator, filter);
    const vBotInterfaces = await this.svBotInterface.getList({ bot });

    if (!vBotInterfaces) {
      throw new Error(`User ${username} does not have bot id ${bot}`);
    }

    return vBotInterfaces;
  }

  @Get('/:provider')
  async details(
    @RequestParam('provider') provider,
    @QueryParam('bot') bot: string,
  ) {
    const vResult = await this.svBotInterface.getByProvider(provider, { bot });
    return vResult;
  }

  /**
   * Update bot script data
   * @param botId
   */
  @Put('/:provider')
  async update(
    @Req() req: any,
    @RequestParam('provider') provider,
    @RequestBody() body,
  ) {
    const { id: idCreator } = req.user;
    const { bot: idBot, accessToken } = body;

    const vResult = await this.svBotInterface.createOrUpdate(
      provider,
      idBot,
      idCreator,
      {
        accessToken,
      },
    );
    return vResult;
  }

}
