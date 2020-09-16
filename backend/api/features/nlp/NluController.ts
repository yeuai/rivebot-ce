import { Controller, Get, Put, Request, RequestParam, QueryParam, Delete, Post, RequestBody } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { NluService } from './NluService';
import { NlpService } from './NlpService';
import { AuthJwt } from '../../policies/auth';

@Controller('/nlu', AuthJwt.optional())
export class NluController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(NlpService)
    private svNlp: NlpService,
    @Inject(NluService)
    private svNlu: NluService,
  ) { }

  @Get('/')
  async train() {
    this.kites.logger.info('Start training intent (test) ...');
    const vReulst = await this.svNlu.trainIntentDev();
    return vReulst;
  }

  /**
   * NLU
   * + Train intent
   * + Train ner
   */
  @Post('/:botid', AuthJwt.required())
  async trainBot(
      @RequestParam('botid') botId: string,
    ) {
    this.kites.logger.info('Start training bot NLU: ' + botId);
    const vReulst = await this.svNlu.trainBot(botId);
    return vReulst;
  }

  /**
   * Extract entities from text
   * @param text
   * @param modelFileId
   */
  @Get('/ner/:text')
  nerExtract(
    @RequestParam('text') text: string,
    @QueryParam('bot') modelFileId: string,
  ) {
    const entities = this.svNlu.extractEntities(text, modelFileId);
    return entities;
  }

}
