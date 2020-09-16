import { Controller, Get, Put, RequestParam, Delete, Post, RequestBody, QueryParam } from '@kites/rest';
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { CMTuDienService } from './CMTuDienService';

@Controller('/cmtudien')
export class CMTuDienController {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(CMTuDienService)
    private svTuDien: CMTuDienService,
  ) { }

  @Get('/')
  async list(
    @QueryParam('domain') domain: string,
    @QueryParam('maLoai') maLoai: string,
    @QueryParam('pageIndex') pageIndex: number,
    @QueryParam('pageSize') pageSize: number,
  ) {
    this.kites.logger.info('Get tu dien he thong with pagination %s', { pageIndex, pageSize });
    const vResult = await this.svTuDien.getList(domain, maLoai, pageIndex, pageSize);
    return vResult;
  }

  @Get('/:ma')
  async info(
    @RequestParam('domain') domain,
    @RequestParam('ma') ma,
  ) {
    const vResult = await this.svTuDien.getByMa(domain, ma);
    this.kites.logger.debug('Get ma info: ' + ma);
    return vResult.find(x => true) || 'Not found';
  }

  /**
   * Hủy không sử dụng mã loại hệ thống
   * @param ma
   */
  @Put('/:ma/inactive')
  async setInactive(
    @QueryParam('domain') domain,
    @RequestParam('ma') ma,
  ) {
    const vResult = await this.svTuDien.setInActive(domain, ma);
    this.kites.logger.info(`setInactive ${ma}, domain=${domain} ok!`);
    return { msg: vResult, ma, domain };
  }

}
