import { Controller, Get, Put, RequestParam, Delete, Post, RequestBody, QueryParam, Request } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { readFile } from 'fs';
import { promisify } from 'util';

import { AuthJwt } from '../../../policies/auth';
import { NlpIntentService } from './NlpIntentService';

@Controller('/nlpintents', AuthJwt.required())
export class NlpIntentController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(NlpIntentService)
    private svNlpIntent: NlpIntentService,
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
    let queryFilter = {};
    try {
      queryFilter = JSON.parse(filter);
      // tslint:disable-next-line: no-empty
    } catch (e) { }

    const vResult = await this.svNlpIntent.getList(queryFilter, from, to - from);
    return vResult;
  }

  @Get('/:id')
  async details(
    @RequestParam('id') botId,
  ) {
    const vResult = await this.svNlpIntent.getById(botId);
    return vResult;
  }

  @Post('/')
  async create() {

    return 'ok';
  }

}
