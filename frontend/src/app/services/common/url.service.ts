import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  parseQueryString (query: string) {
    const parsedParameters = {};
    const uriParameters = query.split('&');

    for (let i = 0; i < uriParameters.length; i++) {
      const parameter = uriParameters[i].split('=');
      parsedParameters[parameter[0]] = decodeURIComponent(parameter[1]);
    }

    return parsedParameters;
  }

  getQueryParams(query: string): object {
    const token = query.indexOf('?');
    return { queryParams: this.parseQueryString(token > 0 ? query.substring(token + 1) : '')};
  }

  getQueryCommands(query: string) {
    const index = query.indexOf('?');
    if (index > 0) {
      return [
        query.substring(0, index),
        // this.getQueryParams(query)
      ];
    } else {
      return [query];
    }
  }

}
