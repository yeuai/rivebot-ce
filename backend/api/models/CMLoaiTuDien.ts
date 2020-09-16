import { getModelForClass, prop } from '@typegoose/typegoose';

class CMLoaiTuDien {
  @prop({
    required: true,
    unique: true,
    uppercase: true,
  })
  maLoai!: string;

  @prop({
    required: true,
  })
  tenLoai!: string;

  @prop({
    default: '',
  })
  ghiChu?: string;

  @prop({
    required: true,
    default: true,
  })
  active!: boolean;
}

/**
 * Model definition
 */
const CMLoaiTuDienModel = getModelForClass(CMLoaiTuDien, {
  schemaOptions: {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
});

export {
  CMLoaiTuDien,
  CMLoaiTuDienModel,
};
