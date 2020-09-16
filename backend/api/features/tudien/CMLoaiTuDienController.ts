import { Controller, Get, Put, RequestParam, Delete, Post, RequestBody, QueryParam } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { CMLoaiTuDienService } from './CMLoaiTuDienService';

@Controller('/cmloaitudien')
export class CMLoaiTuDienController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(CMLoaiTuDienService)
    private svLoaiTuDien: CMLoaiTuDienService,
  ) { }

  @Get('/')
  async list(
    @QueryParam('pageIndex') pageIndex,
    @QueryParam('pageSize') pageSize,
  ) {
    this.kites.logger.info('Get loai tu dien he thong with pagination %s', { pageIndex, pageSize });
    const vResult = await this.svLoaiTuDien.getList(pageIndex, pageSize);
    return vResult;
  }

  @Get('/:ma')
  async info(
    @RequestParam('ma') ma,
  ) {
    const vResult = await this.svLoaiTuDien.getByMa(ma);
    this.kites.logger.debug('Get ma info: ' + ma);
    return vResult || 'Not found';
  }

  /**
   * Hủy không sử dụng mã loại hệ thống
   * @param ma
   */
  @Put('/:ma/inactive')
  async setInactive(
    @RequestParam('ma') ma,
  ) {
    const vResult = await this.svLoaiTuDien.setInActive(ma);
    this.kites.logger.info(`setInactive ${ma} ok!`);
    return { msg: vResult, ma };
  }

}
