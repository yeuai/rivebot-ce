import { Injectable, Inject, LazyServiceIdentifer } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

import { Types } from 'mongoose';
import { each as forEach } from 'lodash';

import { StoryDto, LabeledSentence } from '../data/story.dto';
import { BotAgentModel, NlpSampleModel, NlpSample, FilterNormalizer, NlpIntent, NlpEntity, NlpIntentModel } from '../../../models';
import { BotAgentService } from '../../bot';
import { IobParser } from '../core/IobParser';

/**
 * NLP Sample Service
 */
@Injectable()
export class NlpSampleService {

  iobParser: IobParser;

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(new LazyServiceIdentifer(() => BotAgentService))
    private svBotAgent: BotAgentService,
  ) {
    this.kites.logger.info('Init NLP Sample Service!');
    this.iobParser = new IobParser();
  }

  /**
   * Create an active bot
   * @param data
   */
  create(data: NlpSample) {
    return NlpSampleModel.create([data]);
  }

  async getList(
    filter: object,
    pageIndex: number = 0,
    pageSize: number = 50,
  ) {
    return NlpSampleModel.find(
      FilterNormalizer.from(filter).normalize().filter,
    ).skip(pageIndex * pageSize).limit(pageSize);
  }

  /**
   * Get by id
   * @param id
   */
  async getById(id: string) {
    return NlpSampleModel.findOne({ _id: id, active: true });
  }

  /**
   * Tun off by inactive it
   * @param name
   * @param domain
   */
  setInActive(id: string, botId: string) {
    return NlpSampleModel.findOneAndUpdate({
      _id: id,
      bot: botId,
      active: true,
    }, {
      active: false,
    });
  }

  /**
   * Import bot chat samples
   * @param idBot
   * @param idCreator
   * @param stories
   */
  async importNlpSample(idBot: string, idCreator: string, stories: StoryDto[]) {
    const data: NlpSample[] = [];
    const intents: string[] = [];
    const entities: string[] = [];

    forEach(stories, (story: StoryDto) => {
      forEach(story.labeledSentences, (sent: LabeledSentence) => {
        const text = sent.data && sent.data.reduce((p, tokens) => p + ' ' + tokens[0], '').trim();
        if (!text) {
          return;
        }

        const vNewSample = new NlpSample();
        vNewSample.idBot = Types.ObjectId(idBot);
        vNewSample.idCreator = Types.ObjectId(idCreator);
        vNewSample.text = text;
        vNewSample.data = sent.data;
        vNewSample.intentName = story.intentName;
        data.push(vNewSample);
        intents.push(story.intentName);

        const entities = this.iobParser.matchEntities(sent.data);
        // console.log('Entities: ', JSON.stringify(entities));
      });
    });

    // import intents, entities
    const vSetIntents = new Set(intents);
    const vDataIntents: NlpIntent[] = [];

    for (const intent of vSetIntents) {
      const vIntent = new NlpIntent();
      vIntent.name = intent;
      vIntent.description = intent;
      vIntent.active = true;
      vIntent.idCreator = Types.ObjectId(idCreator);
      vIntent.idBot = Types.ObjectId(idBot);
      vDataIntents.push(vIntent);
    }

    const vIntents = await NlpIntentModel.create(vDataIntents);
    const vResult = await NlpSampleModel.create(data);
    return [vIntents, vResult];
  }

  async getBotNlpData(botName: string) {
    const vResult = await BotAgentModel.findOne({ name: botName });
    const vDataSamples = await NlpSampleModel.find({ idBot: vResult.id }).lean();

    return vDataSamples;
  }

  /**
   * Import data for development
   */
  async importDevNlpSamples(idCreator: string) {
    const data = await import('../data/story.json');
    const vBotDefault = await this.svBotAgent.getByName('default');

    return await this.importNlpSample(vBotDefault.id, idCreator, data as StoryDto[]);
  }

}
