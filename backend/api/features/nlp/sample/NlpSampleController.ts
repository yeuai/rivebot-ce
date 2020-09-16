import { Controller, Get, Put, RequestParam, Delete, Post, RequestBody, QueryParam, Request } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { readFile } from 'fs';
import { promisify } from 'util';

import { AuthJwt } from 'api/policies/auth';
import { upload } from '../../upload/upload.multer';
import { NlpSampleService } from './NlpSampleService';
import { BotAgentService } from '../../bot/BotAgentService';

const readFileAsync = promisify(readFile);

@Controller('/nlpsamples')
export class NlpSampleController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(NlpSampleService)
    private svNlpSample: NlpSampleService,
    @Inject(BotAgentService)
    private svBotAgent: BotAgentService,

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

    const vResult = await this.svNlpSample.getList(queryFilter, from, to - from);
    return vResult;
  }

  @Get('/:id')
  async details(
    @RequestParam('id') botId,
  ) {
    const vResult = await this.svNlpSample.getById(botId);
    return vResult;
  }

  @Post('/')
  async create() {

    return 'ok';
  }

  @Post('/:botid/upload', AuthJwt.required(), upload.single('upload_file'))
  async uploadSampleData
    (
      @Request() req
    ) {

    const { filename, path } = req.file;
    const { username, id: idCreator } = req.user;
    this.kites.logger.info('Upload file success: ' + filename);

    const text = await readFileAsync(path, 'utf-8');
    const data = JSON.parse(text);
    const vBotDefault = await this.svBotAgent.getByName('default');

    const vResult = await this.svNlpSample.importNlpSample(vBotDefault.id, idCreator, data);
    this.kites.logger.info('Import data nlp sample success: ' + filename);
    return vResult;
  }

  @Get('/:botname/data')
  async getBotData
    (
      @RequestParam('botname') botName: string
    ) {
    this.kites.logger.info('Get bot data ...');
    const vResult = await this.svNlpSample.getBotNlpData(botName);
    return vResult;
  }

}
