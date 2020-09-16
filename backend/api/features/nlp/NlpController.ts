import { Controller, Get, Put, Request as Req, RequestParam, Delete, Post, RequestBody, QueryParam } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { AuthJwt } from 'api/policies/auth';
import { NluService } from './NluService';
import { NlpService } from './NlpService';

@Controller('/nlp', AuthJwt.optional())
export class NlpController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(NluService)
    private svNlu: NluService,
    @Inject(NlpService)
    private svNlp: NlpService,
  ) { }

  /**
   * Hàm làm nhiệm vụ phân tách đơn vị từ
   * @param {Request} req
   * @param {Response} res
   */
  @Get('/tok/:text')
  tokenize(
    @RequestParam('text') text: string,
  ) {
    const tokens = this.svNlp.word_tokenize(text);
    return tokens;
  }

  /**
   * Hàm làm nhiệm vụ phân tích ngữ pháp của từ trong câu
   * Bóc tách thực thể nếu tồn có truyền về thông tin id kịch bản
   * @param {Request} req
   * @param {Response} res
   */
  @Get('/pos/:text')
  posTag(
    @RequestParam('text') text: string,
    @QueryParam('bot') botId: string,
  ) {
    const tags = this.svNlp.tagPos(text, botId);
    return tags;
  }

  /**
   * Hàm bóc tách thực thể sử dụng mặc định thư viện vntk
   * @param {Request} req
   * @param {Response} res
   */
  @Get('/ner/:text')
  ner(
    @RequestParam('text') text: string,
    @QueryParam('bot') modelFileId: string,
  ) {
    const tokens = this.svNlp.tagNer(text, modelFileId);

    return tokens;
  }

}
