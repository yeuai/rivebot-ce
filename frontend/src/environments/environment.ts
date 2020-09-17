import { NgxLoggerLevel } from 'ngx-logger';

const {_appsettings = {}} = (window);
const APP_SETTINGS = new Proxy(_appsettings, {
  // get config menu or return default empty.
  get: (target, name) => {
    if (!target[name as any]) {
      console.warn('No config option:', name);
      return '';
    } else {
      return target[name as any];
    }
  }
});

const environment = {
  production: false,
  environment: 'LOCAL',
  baseUrl: '',
  imageUrl: '',
  reportUrl: '',
  client_id: '',
  client_secret: '',
  LOG_LEVEL: NgxLoggerLevel.DEBUG
};

export {
  APP_SETTINGS,
  environment,
};
