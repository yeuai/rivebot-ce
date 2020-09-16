import { Injectable, Inject } from '@kites/common';
import { CMTuDien, CMTuDienModel } from '../../models';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { CMLoaiTuDienService } from './CMLoaiTuDienService';

@Injectable()
export class CMTuDienService {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
    @Inject(CMLoaiTuDienService)
    private svLoaiTuDien: CMLoaiTuDienService,
  ) { }

  create(data: {
    domain: string,
    ma: string,
    ten: string,
    ghiChu?: string,
    uuTien?: number,
  }) {
    const vTuDien = new CMTuDien();
    vTuDien.domain = data.domain;
    vTuDien.ma = data.ma;
    vTuDien.ten = data.ten;
    vTuDien.ghiChu = data.ghiChu;
    vTuDien.uuTien = data.uuTien;

    return CMTuDienModel.create([vTuDien]);
  }

  /**
   * Get list loai tu dien he thong
   * @param domain
   */
  getList(
    domain: string,
    maLoai: string,
    pageIndex: number = 0,
    pageSize: number = 50,
  ) {
    const query = { domain, maLoai };
    if (!maLoai) {
      delete query.maLoai;
    }
    return CMTuDienModel.find(query).skip(pageIndex * pageSize).limit(pageSize);
  }

  /**
   * Get by ma
   * @param ma
   * @param domain
   */
  async getByMa(ma: string, domain: string) {
    return CMTuDienModel.find({ domain, ma, active: true });
  }

  /**
   * Get by maLoai
   * @param maLoai
   * @param domain
   */
  async getByMaLoai(maLoai: string, domain: string) {
    const { id } = await this.svLoaiTuDien.getByMa(maLoai);
    return await CMTuDienModel.find({ domain, idLoaiTuDien: id, active: true });
  }

  /**
   * Tunoff bang ma by inactive it
   * @param ma
   * @param domain
   */
  setInActive(ma: string, domain: string) {
    return CMTuDienModel.findOneAndUpdate({
      ma, domain, active: true,
    }, {
      active: false,
    });
  }

}
