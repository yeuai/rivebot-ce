import { Injectable, Inject } from '@kites/common';
import { DMCodeModel } from '../../models';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { UtilService } from '../../common';

import * as _ from 'lodash';
import moment from 'moment';

@Injectable()
export class CodeService {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(UtilService)
    private svUtil: UtilService,
  ) { }

  /**
   * Get next ma sequence
   */
  getNextSeq(ma: string, domain: string, isTang = true, tienTo = '', hauTo = '', doDai = 8) {
    return this.retryOperation({
      ma,
      domain,
      isTang,
      tienTo,
      hauTo,
      doDai,
    });
  }

  /**
   * Get list bang ma in a domain
   * @param domain
   */
  getList(domain: string, pageIndex: number = 0, pageSize: number = 10) {
    return DMCodeModel.find({ domain }).skip(pageIndex * pageSize).limit(pageSize);
  }

  /**
   * Get current ma
   * @param ma
   * @param domain
   */
  getByMa(ma: string, domain: string) {
    return DMCodeModel.find({ ma, domain, active: true });
  }

  /**
   * Tunoff bang ma by inactive it
   * @param ma
   * @param domain
   */
  setInActive(ma: string, domain: string) {
    return DMCodeModel.findOneAndUpdate({
      ma, domain, active: true,
    }, {
      active: false,
    });
  }

  /**
   * GetNextSeqRetry
   * @param params
   * @param delay
   * @param retries
   */
  private retryOperation(
    params: {
      ma: string,
      domain: string,
      isTang?: boolean,
      tienTo?: string,
      hauTo?: string,
      doDai?: number,
    },
    delay = 300,
    retries = 5,
  ) {
    const operation = this.tryToGetNextMa(params);
    return new Promise((resolve, reject) => {
      return operation.then(resolve)
        .catch((reason) => {
          this.kites.logger.warn(`Retries remain: ${retries}, reason=${reason}`);
          if (retries - 1 > 0) {
            return this.svUtil.wait(delay)
              .then(this.retryOperation.bind(this, params, delay, retries - 1))
              .then(resolve)
              .catch(reject);
          } else {
            return reject(reason);
          }
        });
    });
  }

  /**
   * Lưu mã số mới được cấp
   * - options:
   *      + iMaBenhVien (empty)
   *      + isTang (empty)
   *      + iTienTo (empty)
   *      + iHauTo (empty)
   *      + idoDai (8)
   *      + retries (3)
   */
  private async tryToGetNextMa(
    options: {
      ma: string,
      domain: string,
      isTang?: boolean,
      tienTo?: string,
      hauTo?: string,
      doDai?: number,
    },
  ) {
    const { ma, domain, tienTo, hauTo, doDai, isTang } = options;
    if (!ma) { throw new Error('tryToGetNextMa: param is missing -> `ma`'); }
    let vBangMa = await DMCodeModel.findOne({ ma, domain });
    if (!vBangMa) {
      vBangMa = await DMCodeModel.create({
        ma,
        ten: ma,
        domain,
        ghiChu: '<Code auto generated> //TODO: update ten & ghiChu!',
        tienTo,
        hauTo,
        doDai,
        isTang,
        soTiepTheo: 1,
        tienToHienTai: '',
        isResettable: true,
        active: true,
      });
    }
    const today = moment();
    const YYYY = today.format('YYYY');
    const YY = today.format('YY');
    const MM = today.format('MM');
    const DD = today.format('DD');
    const vIdConfig = vBangMa.id;
    const vDocumentCurrentVersion = vBangMa.__v;

    // tiền tố (prefix)
    const vTienTo = vBangMa.tienTo.replace('YYYY', YYYY)
      .replace('YY', YY)
      .replace('MM', MM)
      .replace('DD', DD);
    // hậu tố (suffix)
    const vHauTo = vBangMa.hauTo.replace('YYYY', YYYY)
      .replace('YY', YY)
      .replace('MM', MM)
      .replace('DD', DD);
    // check reset value configuration by vTienTo
    if (vBangMa.isResettable && vBangMa.tienToHienTai !== vTienTo) {
      // reset soTiepTheo
      vBangMa.soTiepTheo = 1;
    }
    // generate sequence number
    const maSeq = _.padStart(vBangMa.soTiepTheo + '', doDai - vTienTo.length - vHauTo.length, '0');
    const maSinhHienTai = [vTienTo, maSeq, vHauTo].join('');
    const updateFields = {
      maSinhHienTai,
      tienToHienTai: vTienTo,
    };
    const updateObj = {
      $set: updateFields,
      $inc: {
        soTiepTheo: vBangMa.isTang ? 1 : 0,
        __v: 1,
      },
    };
    const updatedObj = await DMCodeModel.findOneAndUpdate({
      _id: vIdConfig,
      __v: vDocumentCurrentVersion,
    }, updateObj);

    if (!updatedObj) {
      this.kites.logger.error(`Khong the cap so, bang ma: id=${vIdConfig}, ma=${ma}, version=${vDocumentCurrentVersion}, code=${maSinhHienTai}`);
      return Promise.reject(`Duplicate DMBangMa: Domain=${domain}, Ma=${ma}`);
    } else {
      this.kites.logger.debug(`GetNextMa Ok: Domain=${domain}, Ma=${ma}, SoHienTai=${maSinhHienTai}`);
      return updateFields;
    }
  }

}
