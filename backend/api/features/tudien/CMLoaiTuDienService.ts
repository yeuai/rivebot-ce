import { Injectable, Inject } from '@kites/common';
import { CMLoaiTuDienModel, CMLoaiTuDien } from '../../models';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';

@Injectable()
export class CMLoaiTuDienService {

  constructor(
    @Inject(KITES_INSTANCE)
    private kites: KitesInstance,
  ) { }

  create(data: CMLoaiTuDien) {
    return CMLoaiTuDienModel.create([data]);
  }

  /**
   * Get list loai tu dien he thong
   * @param domain
   */
  getList(pageIndex: number = 0, pageSize: number = 50) {
    return CMLoaiTuDienModel.find({}).skip(pageIndex * pageSize).limit(pageSize);
  }

  /**
   * Get by ma
   * @param maLoai
   * @param domain
   */
  async getByMa(maLoai: string) {
    const vResult = await CMLoaiTuDienModel.find({ maLoai, active: true });
    return vResult.find(x => true);
  }

  /**
   * setInActive
   * @param ma
   * @param domain
   */
  setInActive(ma: string) {
    return CMLoaiTuDienModel.findOneAndUpdate({
      ma,
      active: true,
    }, {
      active: false,
    });
  }

}
