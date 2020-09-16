import { Injectable, Inject, LazyServiceIdentifer } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { FilterNormalizer, NlpEntity, NlpEntityModel } from 'api/models';
import { BotAgentService } from 'api/features';

/**
 * NLP Entity Service
 */
@Injectable()
export class NlpEntityService {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(new LazyServiceIdentifer(() => BotAgentService))
    private svBotAgent: BotAgentService,
  ) {
    this.kites.logger.info('Init NLP Entity Service!');
  }

  /**
   * Create an active bot
   * @param data
   */
  create(data: NlpEntity) {
    return NlpEntityModel.create([data]);
  }

  async getList(
    filter: object,
    pageIndex: number = 0,
    pageSize: number = 50,
  ) {
    return NlpEntityModel.find(
      FilterNormalizer.from(filter).normalize().filter,
    ).skip(pageIndex * pageSize).limit(pageSize);
  }

  /**
   * Get by id
   * @param id
   */
  async getById(id: string) {
    return NlpEntityModel.findOne({ _id: id, active: true });
  }

  /**
   * Tun off by inactive it
   * @param name
   * @param domain
   */
  setInActive(id: string, botId: string) {
    return NlpEntityModel.findOneAndUpdate({
      _id: id,
      bot: botId,
      active: true,
    }, {
      active: false,
    });
  }

}
