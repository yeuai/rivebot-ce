import { KitesFactory, KitesInstance } from '@kites/core';
import Express from '@kites/express';
import Rest from '@kites/rest';

import mongoose from 'mongoose';
import { MongoDbServerDev, appRoutes } from './content/extensions';
import {
  WordFeatures, IntentService, IntentClassifier, IobParser,
  SequenceLabeler, NerService, NLUService,
} from '@api/index';

async function bootstrap() {
  const app = await KitesFactory
    .create({
      loadConfig: true,
      providers: [
        WordFeatures,
        IntentClassifier,
        IobParser,
        SequenceLabeler,
        IntentService,
        NerService,
        NLUService,
      ],
    })
    .use(Express)
    .use(Rest)
    .use(appRoutes)
    .use(MongoDbServerDev)
    .on('db:connect', (uri: string, kites: KitesInstance) => {
      if (typeof uri === 'string') {
        mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
        });
        kites.logger.info('Mongodb connect ok: ' + uri);
      } else {
        // get connection string from kites.config
        kites.logger.error('Please config mongodb connection!!!');
      }
    })
    .init();

  app.logger.info(`Server started!`);
}

bootstrap();
