import { Controller, Get, Put, Request, RequestParam, Delete, Post, RequestBody, QueryParam } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { BotChatService, BotAgentService } from './';
import { Request as BotScriptRequest } from '@yeuai/botscript';
import { AuthJwt } from '../../policies/auth';
import { UserService } from '../user/user.service';
import { MessageService } from '../history/message.service';

@Controller('/chat', AuthJwt.optional())
export class BotChatController {

  // private svBotChat: BotChatService;
  // private svBotAgent: BotAgentService;

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(BotChatService)
    private svBotChat: BotChatService,
    @Inject(BotAgentService)
    private svBotAgent: BotAgentService,
  ) {
    // TODO: Resolve Error:
    // Injection error. Recursive dependency detected in constructor for type BotChatController with parameter at index 1
    // this.svBotAgent = new BotAgentService(kites, new UserService(kites));
    // this.svBotChat = new BotChatService(kites, new MessageService(kites));
    this.kites.logger.info('Init bot chat controller!');
  }

  // @Get('/:text')
  // async info(
  //   @RequestParam('text') text,
  // ) {
  //   const vResult = await this.svBotChat.reply(new Request(text));
  //   this.kites.logger.debug('Bot reply: ', text, vResult.speechResponse);
  //   return vResult;
  // }

  @Post('/')
  async chat(
    @Request() req,
    @RequestBody() context: BotScriptRequest,
  ) {
    // TODO: Create Request Proxy to ensure `variables`, `array` initialzed
    // Example: const ctx = new RequestProxy(context);
    const {id: idCreator} = req;
    const vBotDev = await this.svBotAgent.getBotScriptsOrDefault(context.botId, idCreator);
    context.botId = vBotDev.id;
    this.kites.logger.debug('Bot request: ', context.message);

    const vResult = await this.svBotChat.reply(context, vBotDev);
    this.kites.logger.debug('Bot reply: ', context.message, vResult.speechResponse);

    return vResult;
  }

}
