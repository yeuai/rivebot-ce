import { Controller, Get, Put, RequestParam, Delete, Post, RequestBody, QueryParam } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { MessageService } from './message.service';

@Controller('/messages')
export class MessageController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(MessageService)
    private svMessage: MessageService,
  ) { }

  @Get('/')
  async list(
    @QueryParam('filter') filter: any,
    @QueryParam('range') range: any,
    @QueryParam('sort') sort: any,
  ) {
    const [from, to] = JSON.parse(range || '[0, 10]');
    const [field, asc] = JSON.parse(sort || `["name", "desc"]`);
    this.kites.logger.info('Get message list: %s', filter);
    const queryFilter = JSON.parse(filter);
    // console.log(from, to, field, asc, queryFilter);
    const vResult = await this.svMessage.getList(queryFilter, from, to - from);
    return vResult;
  }

  @Get('/:id')
  async details(
    @RequestParam('id') botId,
  ) {
    const vResult = await this.svMessage.getById(botId);
    return vResult;
  }

  @Post('/')
  async create() {

    return 'ok';
  }

}
