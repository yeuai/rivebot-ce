import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class GuidService {

  constructor() {}

  public get GuidEmpty () {
    return '00000000-0000-0000-0000-000000000000';
  }

  S4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  newGuid(): string {
    // then to call it, plus stitch in '4' in the third group
    return (this.S4() + this.S4() + '-' + this.S4() + '-4' +
            this.S4().substr(0, 3) + '-' + this.S4() + '-' + this.S4() +
            this.S4() + this.S4())
        .toLowerCase();
  }

  strTimKiem(str: string, searchStr: string): boolean {
    if (searchStr) {
      return this.strKhongDau(str).includes(this.strKhongDau(searchStr));
    }
    return true;
  }

  strKhongDau(str: string): string {
    str = str.toLowerCase();
    const KyTu = [
      'aeouidy',
      'áàạảãâấầậẩẫăắằặẳẵ',
      'éèẹẻẽêếềệểễ',
      'óòọỏõôốồộổỗơớờợởỡ',
      'úùụủũưứừựửữ',
      'íìịỉĩ',
      'đ',
      'ýỳỵỷỹ'
    ];

    for (let i = 1; i < KyTu.length; i++) {
      for (let j = 0; j < KyTu[i].length; j++) {
        str = str.replace(KyTu[i][j], KyTu[0][i - 1]);
      }
    }
    return str;
  }
}
