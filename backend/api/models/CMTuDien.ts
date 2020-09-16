import { getModelForClass, prop } from '@typegoose/typegoose';

class CMTuDien {
  @prop({
    required: true,
  })
  domain!: string;

  @prop({
    required: true,
  })
  ma!: string;

  @prop({
    required: true,
  })
  ten!: string;

  @prop({
    default: '',
  })
  ghiChu?: string;

  @prop({
    default: 0,
  })
  uuTien!: number;

  @prop({
    default: true,
  })
  active!: boolean;

  @prop()
  idLoaiTuDien!: string;
}

/**
 * Model definition
 */
const CMTuDienModel = getModelForClass(CMTuDien, {

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
  CMTuDien,
  CMTuDienModel,
};
