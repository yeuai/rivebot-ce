import { Injectable, Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { FilterNormalizer, NlpIntent, NlpIntentModel } from '../../../models';

/**
 * NLP Intent Service
 */
@Injectable()
export class NlpIntentService {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
  ) {
    this.kites.logger.info('Init NLP Intent Service!');
  }

  /**
   * Create an active bot
   * @param data
   */
  create(data: NlpIntent) {
    return NlpIntentModel.create([data]);
  }

  async getList(
    filter: object,
    pageIndex: number = 0,
    pageSize: number = 50,
  ) {
    return NlpIntentModel.find(
      FilterNormalizer.from(filter).normalize().filter,
    ).skip(pageIndex * pageSize).limit(pageSize);
  }

  /**
   * Get by id
   * @param id
   */
  async getById(id: string) {
    return NlpIntentModel.findOne({ _id: id, active: true });
  }

  /**
   * Tun off by inactive it
   * @param name
   * @param domain
   */
  setInActive(id: string, botId: string) {
    return NlpIntentModel.findOneAndUpdate({
      _id: id,
      bot: botId,
      active: true,
    }, {
      active: false,
    });
  }

}
