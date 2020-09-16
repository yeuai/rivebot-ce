import * as _ from 'lodash';

export class FilterNormalizer {
  constructor(private _filter: any) {
  }

  /**
   * Get output filter
   */
  get filter() {
    return this._filter;
  }

  /**
   * Normalize all
   */
  normalize() {
    return this
      .normalizeArray()
      .normalizeId();
  }

  /**
   * Normalize array prop
   * Ex: {"id":["5dfc10347d7a230c08e5c7be"]}
   */
  normalizeArray() {
    const filter = this._filter;
    // convert key-value is array
    for (const key in filter) {
      if (_.isArrayLike(key)) {
        filter[key] = {
          $in: filter[key],
        };
      }
    }
    return this;
  }

  /**
   * Normalize id in mongoose
   */
  normalizeId() {
    if (_.has(this._filter, 'id')) {
      const filter = this._filter;
      filter._id = filter.id;
      delete filter.id;
    }
    return this;
  }

  static from(filter: any) {
    return new FilterNormalizer(filter);
  }

}
