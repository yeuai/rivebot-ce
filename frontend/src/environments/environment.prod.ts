import { NgxLoggerLevel } from 'ngx-logger';

let reportUrl = 'https://report.hsdt.co/reporting';
if (window._appsettings != null) {
  reportUrl = window._appsettings.baseUri.UrlReport;
}

export const environment = {
  production: true,
  environment: 'PROD',
  // get from local storage, file storage
  baseUrl: '',  // https://bvungbuou.hosoyte.com
  reportUrl,
  client_id: '',
  client_secret: '',
  LOG_LEVEL: NgxLoggerLevel.WARN
};
