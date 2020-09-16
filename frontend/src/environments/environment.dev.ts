import { NgxLoggerLevel } from 'ngx-logger';

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `index.ts`, but if you do
// `ng build --env=prod` then `index.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  environment: 'LOCAL',
  baseUrl: '',
  imageUrl: '',
  reportUrl: '',
  client_id: '3E46A49F-EE20-4A48-B29C-48B010026E1F',
  client_secret: 'test',
  LOG_LEVEL: NgxLoggerLevel.DEBUG
};
