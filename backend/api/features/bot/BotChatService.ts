import { Injectable, Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { BotScript as BotScriptEngine, Request, Context } from '@yeuai/botscript';
import { BotScript, BotAgent } from '../../models';
import { readFileSync } from 'fs';
import { MessageService } from '../../features';
import { NluService } from 'api/features/nlp';

@Injectable()
export class BotChatService {

  private botEngine: BotScriptEngine;
  private svNlu: NluService;

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(MessageService)
    private svMessage: MessageService,
    // @Inject(NluService)
    // private svNlu: NluService,
  ) {
    this.kites.logger.info('Init BotScript Service!');
    this.svNlu = new NluService(kites);
    this.botEngine = new BotScriptEngine();
    this.botEngine.on('*', this.logEventHandler.bind(this));

    const defaultBot = kites.appDirectory + '/bots/default.bot';
    const data = readFileSync(defaultBot, 'utf-8');
    this.botEngine.parse(data);

    this.botEngine.addPatternCapability({
      name: 'Tokens Regex',
      match: /^some pattern/,
      func: (pattern) => {

        return / /;
      },
    });
    this.botEngine.addPatternCapability({
      name: 'Intent Detection',
      match: /^intent:/,
      func: (pattern, req) => ({
        source: pattern,
        test: (input) => {
          const vIntentName = pattern.replace(/^intent:/i, '').trim();
          console.log('Intent detect: ', req.intent);
          return req.intent === vIntentName;
        },
        exec: (input) => {
          // entities list
          const vEntities = req.entities.map((x: any) => x.value);
          console.log('Extracted entities: ', vEntities);
          return vEntities;
        },
        toString: () => pattern,
      }),
    });

    this.botEngine.plugin('nlp', this.nlpExtractor.bind(this));
  }

  /**
   * Plugin: NLP Extractor
   * @param req
   * @param ctx
   */
  private async nlpExtractor(req: Request) {
    const vIdBot = req.botId;
    const vIntent = await this.svNlu.svIntent.predictFromModel(req.message, `intent.model.bin`);
    req.entities = this.svNlu.extractEntities(req.message, vIdBot)
    req.intent = vIntent as string;
    return req;
  }

  /**
   * Log Event Handler
   * @param event
   * @param req
   * @param ctx
   * @param command
   * @param result
   */
  private async logEventHandler(event: string, req: Request, ctx: Context, command: string, result: any) {
    try {
      console.log('Request: ', req.message, req);
      this.kites.logger.info('Bot event: %s, %s -> %s', event, req.message, req.speechResponse);
      // TODO: Log chat ~messages~, events, ...
      if (event === 'reply') {
        const variables = {};
        Object.keys(req.variables)
          .filter(x => !['$', '$input'].includes(x))
          .forEach(x => {
            variables[`${x.replace(/^\$+/, '')}`] = req.variables[x];
          });

        // logs message chat
        await this.svMessage.create({
          idBot: req.botId || 'default',
          input: req.message,
          speechResponse: req.speechResponse,
          context: {
            currentDialogue: req.currentDialogue,
            currentFlow: req.currentFlow,
            flows: req.flows,
            isFlowing: req.isFlowing,
            missingFlows: req.missingFlows,
            prompt: req.prompt,
            variables,
          },
        });
      } else {
        if (event === 'command') {
          // Bot executed a command
          this.kites.logger.info(`Bot executed a command: ${command}`);
        }
        this.kites.logger.info('TODO: Log events!');
      }
    } catch (error) {
      console.log(error);
      this.kites.logger.error('Event logs error!', error);
    }

  }

  async reply(req: Request, bot: BotAgent) {
    if (!bot) {
      throw new Error('Bot not found: ' + req.botId);
    } else if (!bot.scripts || bot.scripts.length === 0) {
      throw new Error('Bot scripts not found: ' + bot.name);
    }

    const tmpBot = new BotScriptEngine();
    for (const item of bot.scripts) {
      const script = item as BotScript;
      try {
        tmpBot.parse(script.content);
      } catch (error) {
        this.kites.logger.error(`Can not parse data context: ${script.topic}, ${error}`);
      }
    }
    // reset request state

    req.intent = undefined;   // reset intent
    req.entities = {};
    req.previous = req.previous || [];  // previous must not be empty
    // copy origin pattern
    tmpBot.context.patterns = this.botEngine.context.patterns;
    return this.botEngine.handleAsync(req, tmpBot.context);
  }

}
