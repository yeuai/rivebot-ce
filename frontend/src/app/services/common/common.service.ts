import {
  Injectable
} from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private ChuSo: string[] = [' không ', ' một ', ' hai ', ' ba ', ' bốn ', ' năm ', ' sáu ', ' bảy ', ' tám ', ' chín '];
  private Tien: string[] = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ', ' triệu tỷ'];
  public _idEmpty: '00000000-0000-0000-0000-000000000000';
  constructor() {}


  ConvertDateToTuoi(ngaySinh, homNay) {
    // Yêu cầu ngaySinh, homNay có định dạng: 'MM/DD/YYYY'
    homNay = homNay || new Date();
    const datNgaySinh = new Date(ngaySinh);
    const datHomNay = new Date(homNay);
    const year = datHomNay.getFullYear() - datNgaySinh.getFullYear();
    let month = datHomNay.getMonth() - datNgaySinh.getMonth() + year * 12;
    let result = '';
    // TODO: chốt cách tính tuổi
    // 12/4 -> 15/4 : 3 ngay
    // 12/4/2013 -> 11/4/2015 -> Ngay trong thang Be hon thi tru 1 thang  24 thang - 1 thang
    // 12/4/2000 -> 11/4/2015 -> 15 tuoi
    //

    if (datHomNay.getDate() < datNgaySinh.getDate()) {
      month -= 1;
    }
    if (month > 72) {
      // Ngày 30/05/2015 chốt tuổi bằng năm - năm ko tính theo ngày tháng
      // if (datHomNay.DayOfYear >= datNgaySinh.DayOfYear)
      // {
      if (year < 10) {
        result = '0' + year;
      } else {
        result = '' + year;
      }
      return result;
      // }
      // else
      // {
      //    return (year - 1).ToString("00");
      // }
    } else {

      if (month >= 2) {
        if (month < 10) {
          result = '0' + month;
        } else {
          result = '' + month;
        }
        return result + ' Tháng';
      } else {
        const tNgaySinh = Math.floor(datNgaySinh.getTime() / (1000 * 60 * 60 * 24));
        const tHomNay = Math.floor(datHomNay.getTime() / (1000 * 60 * 60 * 24));
        const totalDay = tHomNay - tNgaySinh;
        if (totalDay === 0) {
          return '01 Ngày';
        } else {
          if (totalDay < 10) {
            result = '0' + totalDay;
          } else {
            result = '' + totalDay;
          }
          return result + ' Ngày';
        }
      }
    }
  }

  ConvertDateToTuoiKB(ngaySinh, homNay) {
    // Yêu cầu ngaySinh, homNay có định dạng: 'MM/DD/YYYY'
    const datNgaySinh = new Date(ngaySinh);
    const datHomNay = new Date(homNay);
    const year = datHomNay.getFullYear() - datNgaySinh.getFullYear();
    const month = datHomNay.getMonth() - datNgaySinh.getMonth() + year * 12;
    let result = '';
    // TODO: chốt cách tính tuổi
    // 12/4 -> 15/4 : 3 ngay
    // 12/4/2013 -> 11/4/2015 -> Ngay trong thang Be hon thi tru 1 thang  24 thang - 1 thang
    // 12/4/2000 -> 11/4/2015 -> 15 tuoi
    //
    if (month > 12) {
      if (year < 10) {
        result = '0' + year;
      } else {
        result = '' + year;
      }
      return result;
    } else {
      return '1';
    }
  }
  IsDateTreEmDuoi1Tuoi(ngaySinh, homNay) {
    // Yêu cầu ngaySinh, homNay có định dạng: 'MM/DD/YYYY'
    const datNgaySinh = new Date(ngaySinh);
    const datHomNay = new Date(homNay);
    const year = datHomNay.getFullYear() - datNgaySinh.getFullYear();
    let month = datHomNay.getMonth() - datNgaySinh.getMonth() + year * 12;

    // TODO: chốt cách tính tuổi
    // 12/4 -> 15/4 : 3 ngay
    // 12/4/2013 -> 11/4/2015 -> Ngay trong thang Be hon thi tru 1 thang  24 thang - 1 thang
    // 12/4/2000 -> 11/4/2015 -> 15 tuoi
    //

    if (datHomNay.getDate() < datNgaySinh.getDate()) {
      month -= 1;
    }
    if (month < 12) {
      return true;
    } else {
      return false;
    }
  }
  ConvertDateToDays(dateFrom, dateTo) {
    const datFrom = new Date(dateFrom);
    const datTo = new Date(dateTo);
    const tDatFrom = Math.floor(datFrom.getTime() / (1000 * 60 * 60 * 24));
    const tDatTo = Math.floor(datTo.getTime() / (1000 * 60 * 60 * 24));
    return tDatTo - tDatFrom;
  }

  dateIsNull(date) {
    if (!date || date === '0001-01-01T00:00:00') {
      return true;
    }
    return false;
  }

  guidIsNuLL(str) {
    if (!str || str === '' || str === this._idEmpty) {
      return true;
    }
    return false;
  }

  guidIsNotNuLL(str) {
    if (str && str !== '' && str !== this._idEmpty) {
      return true;
    }
    return false;
  }

  strIsNotNull(str) {
    if (str && str !== '') {
      return true;
    }
    return false;
  }

  strIsNull(str) {
    if (typeof str === undefined) {
      return true;
    }
    if (!str || str === '') {
      return true;
    }
    return false;
  }

  strInclude(str, str2) {
    if (str && str !== '') {
      return str.includes(str2);
    }
    return false;
  }

  strIsTrue(str) {
    if (str && str === 'true') {
      return true;
    }
    return false;
  }
  strIsX(str) {
    if (str && str.toString().toLowerCase() === 'X') {
      return true;
    }
    return false;
  }
  strIsDateTime(str) {
    const d = moment(str, 'YYYY-MM-DD');
    if (d == null || !d.isValid()) {
      return false;
    }

    return str.indexOf(d.format('YYYY-MM-DD')) >= 0;
  }

  strToNumber(str) {
    if (str) {
      str = str.replace(/,/g, '');
      return parseFloat(str);
    }
    return null;
  }


  ConvertDateTuoiDuoi1(ngaySinh, homNay) {
    // Yêu cầu ngaySinh, homNay có định dạng: 'MM/DD/YYYY'
    const datNgaySinh = new Date(ngaySinh);
    const datHomNay = new Date(homNay);
    const year = datHomNay.getFullYear() - datNgaySinh.getFullYear();
    let month = datHomNay.getMonth() - datNgaySinh.getMonth() + year * 12;

    // TODO: chốt cách tính tuổi
    // 12/4 -> 15/4 : 3 ngay
    // 12/4/2013 -> 11/4/2015 -> Ngay trong thang Be hon thi tru 1 thang  24 thang - 1 thang
    // 12/4/2000 -> 11/4/2015 -> 15 tuoi
    //

    if (datHomNay.getDate() < datNgaySinh.getDate()) {
      month -= 1;
    }
    if (month > 12) {
      return false;
    }
    return true;
  }

  formatSoBHYT(SoBHYT) {
    if (!SoBHYT) {
      return '';
    }
    return SoBHYT.substr(0, 2) +
      '-' + SoBHYT.substr(2, 1) +
      '-' + SoBHYT.substr(3, 2) +
      '-' + SoBHYT.substr(5, 2) +
      '-' + SoBHYT.substr(7, 3) +
      '-' + SoBHYT.substr(10, 5);
  }

  DocSo3ChuSo(baso: number) {
    let KetQua = '';
    const tram = Math.floor(baso / 100);
    const chuc = Math.floor((baso % 100) / 10);
    const donvi = Math.floor(baso % 10);
    if (tram === 0 && chuc === 0 && donvi === 0) {
      return '';
    }
    if (tram !== 0) {
      KetQua += this.ChuSo[tram] + ' trăm ';
      if ((chuc === 0) && (donvi !== 0)) {
        KetQua += ' linh ';
      }
    }
    if ((chuc !== 0) && (chuc !== 1)) {
      KetQua += this.ChuSo[chuc] + ' mươi';
      if ((chuc === 0) && (donvi !== 0)) {
        KetQua = KetQua + ' linh ';
      }
    }
    if (chuc === 1) {
      KetQua += ' mười ';
    }
    switch (donvi) {
      case 1:
        if ((chuc !== 0) && (chuc !== 1)) {
          KetQua += ' mốt ';
        } else {
          KetQua += this.ChuSo[donvi];
        }
        break;
      case 5:
        if (chuc === 0) {
          KetQua += this.ChuSo[donvi];
        } else {
          KetQua += ' lăm ';
        }
        break;
      default:
        if (donvi !== 0) {
          KetQua += this.ChuSo[donvi];
        }
        break;
    }
    return KetQua;
  }

  DocSoBangChu(SoTien: number) {
    let lan = 0;
    let i = 0;
    let so = 0;
    let KetQua = '';
    let tmp = '';
    const ViTri: any[] = [];
    if (SoTien < 0) {
      return 'Số tiền âm !';
    }
    if (SoTien === 0) {
      return 'Không đồng !';
    }
    if (SoTien > 0) {
      so = SoTien;
    } else {
      so = -SoTien;
    }
    if (SoTien > 8999999999999999) {
      // SoTien = 0;
      return 'Số quá lớn!';
    }
    ViTri[5] = Math.floor(so / 1000000000000000);
    if (isNaN(ViTri[5])) {
      ViTri[5] = '0';
    }
    so = so - parseFloat(ViTri[5].toString()) * 1000000000000000;
    ViTri[4] = Math.floor(so / 1000000000000);
    if (isNaN(ViTri[4])) {
      ViTri[4] = '0';
    }
    so = so - parseFloat(ViTri[4].toString()) * 1000000000000;
    ViTri[3] = Math.floor(so / 1000000000);
    if (isNaN(ViTri[3])) {
      ViTri[3] = '0';
    }
    so = so - parseFloat(ViTri[3].toString()) * 1000000000;
    ViTri[2] = Math.floor(so / 1000000);
    if (isNaN(ViTri[2])) {
      ViTri[2] = '0';
    }
    ViTri[1] = Math.floor((so % 1000000) / 1000);
    if (isNaN(ViTri[1])) {
      ViTri[1] = '0';
    }
    ViTri[0] = so % 1000;
    if (isNaN(ViTri[0])) {
      ViTri[0] = '0';
    }
    if (ViTri[5] > 0) {
      lan = 5;
    } else if (ViTri[4] > 0) {
      lan = 4;
    } else if (ViTri[3] > 0) {
      lan = 3;
    } else if (ViTri[2] > 0) {
      lan = 2;
    } else if (ViTri[1] > 0) {
      lan = 1;
    } else {
      lan = 0;
    }
    for (i = lan; i >= 0; i--) {
      tmp = this.DocSo3ChuSo(ViTri[i]);
      KetQua += tmp;
      if (ViTri[i] > 0) {
        KetQua += this.Tien[i];
      }
      if ((i > 0) && (tmp.length > 0)) {
        KetQua += ',';
      }
    }
    if (KetQua.substring(KetQua.length - 1) === ',') {
      KetQua = KetQua.substring(0, KetQua.length - 1);
    }
    return KetQua;
  }

  ConverTienCoDauPhay2(sTien, sThatPhan?) {
    let soAm = '';
    if (('' + sTien).indexOf('-') === 0) {
      sTien = ('' + sTien).replace(/\-/g, '');
      soAm = '-';
    }
    if (parseFloat('0' + sTien) === 0) {
      return '';
    }
    sTien = (sTien + '').replace(/\,/g, '');
    const arrTien = (sTien + '').split('.');
    const strTien = arrTien[0];
    let result = '';

    for (let i = strTien.length - 1; i >= 0; i--) {

      result = strTien[i] + result;
      if ((strTien.length - i) % 3 === 0 && i !== 0) {
        result = ',' + result;
      }
    }

    if (arrTien.length > 1) {
      result = result + '.';
      const strPhatPhan = arrTien[1];
      for (let i = 0; i < strPhatPhan.length; i++) {
        if (i === sThatPhan) {
          break;
        }
        result = result + strPhatPhan[i];
      }
    }
    return soAm + result;
  }
}
