import { Injectable } from '@kites/common';

@Injectable()
export class UtilService {

  wait(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  }
}
