import * as url from 'url';
import { environment } from './environment';

/**
 * Shortcut get api endpoint
 */
export function getApiUrl(...parts: string[]) {
  const vParts = parts.join('/');
  const vBaseUrl = !environment.baseUrl ? location.origin : environment.baseUrl;

  const vApiUrl = url.resolve(vBaseUrl + '/api/', vParts);
  return vApiUrl;
}

export function getBaseUrl() {
  const vBaseUrl = !environment.baseUrl ? location.origin : environment.baseUrl;

  return vBaseUrl;
}

export function getReportUrl(domain: string, name: string) {
  return environment.reportUrl + `/${domain}/templates/${name}/report`;
}

/**
 * Append thêm đường dẫn vào link URL
 * @param baseUrl
 * @param parts
 */
export function fromApiBaseUrl(baseUrl: string, ...parts: string[]) {
  const vParts = parts.join('/');
  const vApiUrl = url.resolve(baseUrl, vParts);
  return vApiUrl;
}
