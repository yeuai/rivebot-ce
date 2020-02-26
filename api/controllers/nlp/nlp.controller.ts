import { Controller, Get, RequestParam, QueryParam } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import * as vntk from 'vntk';
import { NerService } from 'api/services/ner.service';

const posTagger = vntk.posTag();
const nerTagger = vntk.ner();
const tokenizer = vntk.wordTokenizer();

/**
 * NLP controller
 */
@Controller('/nlp')
export class NLPController {

  constructor(
    @Inject(KITES_INSTANCE) private kites: KitesInstance,
    private svNER: NerService,
  ) {
    this.kites.logger.debug('Init NLP controller!');
  }

  /**
   * Hàm làm nhiệm vụ phân tách đơn vị từ
   * @param {Request} req
   * @param {Response} res
   */
  @Get('/tok/:text')
  tokenize(
    @RequestParam('text') text: string,
  ) {
    const tokens = tokenizer.tag(text);
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
    @QueryParam('storyId') storyId: string,
  ) {
    if (storyId) {
      const pretrainedTags = this.svNER.tag(storyId, text);
      return pretrainedTags;
    } else {
      const tags = posTagger.tag(text).map((tokens) => [tokens[0], tokens[1], 'O']);
      return tags;
    }
  }

  /**
   * Hàm bóc tách thực thể sử dụng mặc định thư viện vntk
   * @param {Request} req
   * @param {Response} res
   */
  @Get('/ner/:text')
  ner(
    @RequestParam('text') text: string,
  ) {
    const tokens = nerTagger.tag(text);
    return tokens;
  }

}
