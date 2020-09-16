import { KitesFactory, KitesInstance } from '@kites/core';
import mongoose from 'mongoose';

import {
  BotAgent,
  BotAgentService,
  BotScriptService,
  BotInterfaceService,
  BotChatService,
  UserService,
  User,
  TodoService,
  CodeService,
  UtilService,
  CMLoaiTuDienService,
  CMTuDienService,
  MessageService,
  InvitationService,
  UserModel,
  IobParser,
  WordFeatures,
  IntentClassifier,
  SequenceLabelerService,
  NlpService,
  NluService,
  NlpSampleService,
  NlpIntentService,
  NlpEntityService,
} from './api';
import { GetDbConnection, AppRoutes, ConfigPassportStrategy } from './extensions';
import pkg from './package.json';

async function bootstrap() {
  const app = await KitesFactory
    .create({
      loadConfig: true,
      discover: true,
      providers: [
        TodoService,
        UserService,
        UtilService,
        CMLoaiTuDienService,
        CMTuDienService,
        CodeService,
        MessageService,
        InvitationService,
        BotAgentService,
        BotScriptService,
        BotInterfaceService,
        BotChatService,
        // NLP Services & Controllers
        IobParser,
        WordFeatures,
        IntentClassifier,
        SequenceLabelerService,
        NlpService,
        NluService,
        NlpIntentService,
        NlpEntityService,
        NlpSampleService,
      ],
      configFile: process.env.APP_CONFIG_FILE,
      version: pkg.version,
    })
    .use(AppRoutes)
    .use(GetDbConnection)
    .use(ConfigPassportStrategy)
    .on('db:connect', async (uri: string, kites: KitesInstance) => {
      if (typeof uri === 'undefined') {
        kites.logger.error('Please config mongodb connection!!!');
        return;
      }

      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      });
      kites.logger.info('Mongodb connect ok: ' + uri);

      // check
      const svUser = kites.container.inject(UserService);
      const svBotAgent = kites.container.inject(BotAgentService);
      const svNlpSamples = kites.container.inject(NlpSampleService);
      let admin = await svUser.get('admin');
      if (!admin) {
        const vUser = new UserModel();
        vUser._id = '5e0ac6455ebb3340e0900674';
        vUser.username = 'admin';
        vUser.password = 'admin';
        vUser.name = 'Admin';

        // add default user
        admin = await svUser.create(vUser);
        kites.logger.info('Add default admin user for administration!');

        // add default bot
        const vDefaultBot = await svBotAgent.clone(admin.id, 'default', '5e71ef334462d936c09ad4ab');
        kites.logger.info('Added default smart bot: ' + vDefaultBot.name);

        const vNlpSamples = await svNlpSamples.importDevNlpSamples(admin.id);
        kites.logger.info('Import nlp samples for development: ' + vNlpSamples.length);
      }

    })
    .init();

  app.logger.info(`Server started!`);
}

bootstrap();
