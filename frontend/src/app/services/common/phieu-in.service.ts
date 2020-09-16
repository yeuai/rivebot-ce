import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IMG_PRINTER } from '@app/shared/data/constants';
import { NGXLogger } from 'ngx-logger';
import { ToastrService } from 'ngx-toastr';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class PhieuInService {

  handlebars: any;

  constructor(
    private logger: NGXLogger,
    private toaster: ToastrService,
    private http: HttpClient,
    private svConfig: AppConfigService,
  ) {
    // load handlebars + helpers from assets
    this.handlebars = window.Handlebars;
    const helpers = window._hbs_helpers;

    if (helpers != null) {
      helpers({
        handlebars: this.handlebars
      });
    }
  }

  /**
   * Chức năng in (sample)
   * TODO: Chuyển về gọi chức năng in phía server (đưa Report về HIS)
   * @param isBanSao in bản sao
   * @param dataContext dữ liệu hóa đơn
   */
  async print(templateName: string, dataContext: any) {
    this.logger.info('Thông tin phiếu in:', dataContext, templateName);
    this.toaster.info('info', 'Đang gửi lệnh in ...');

    // const template = await this.svMauKetQua.get(templateName);
    const template = templateName;
    const print = this.handlebars.compile(template);
    const html = print(dataContext);

    return await this.printHtml(html, true);
  }

  printHtml(strHtml, turnOnSplash, delayOpenTime = 300) {
    const idIframe = Date.now();
    $('body').append('<iframe class="iframePrintPage" id="' + idIframe
      + '" name="' + idIframe + '" src="" width="0" height="0" frameborder="0"></iframe>');
    window.frames[idIframe].document.open();
    window.frames[idIframe].document.write(strHtml);
    window.frames[idIframe].document.title = '\u200E';
    window.frames[idIframe].document.close();
    return new Promise((resolve, reject) => {
      Promise.resolve(1)
        .then(() => {
          if (turnOnSplash === false) {
            return 1;
          } else {
            // turn on splash
            return this.splash(delayOpenTime);
          }
        })
        .then(() => {
          try {
            window.frames[idIframe].print();
            resolve(true);
          } catch (err) {
            console.log('Không bật được window print!');
            reject();
          }
        });
    });
  }

 printUrl(strUrl, turnOnSplash, delayOpenTime = 300) {
    const idIframe = Date.now();
    $('body').append('<iframe id="' + idIframe + '" name="' + idIframe + '" src="' + strUrl + '" width="0" height="0" frameborder="0"></iframe>');
    return new Promise((resolve, reject) => {
        Promise.resolve(1)
        .then(() => {
            if (turnOnSplash === false) {
                return 1;
            } else {
                // turn on splash
                return this.splash(delayOpenTime);
            }
        })
        .then(() => {
            try {
                window.frames[idIframe].print();
                // $("#"+ idIframe).remove();
                resolve(true);
            } catch (err) {
                console.log('Không bật được window print!');
                // $("#"+ idIframe).remove();
                reject();
            }
        });
    });
}
  splash(delayOpenTime = 300) {
    return new Promise((resolve, reject) => {
      if (!$) { return resolve(true); }
      $('body').append(`<div id='printMessageBox' style='\
        position:fixed;\
        top:50%; left:50%;\
        text-align:center;\
        margin: -60px 0 0 -155px;\
        width:310px; height:150px; font-size:16px; padding:10px; color:#222; font-family:helvetica, arial;\
        opacity:0;\
        background:#fff url(${IMG_PRINTER}) center 40px no-repeat;\
        border: 6px solid #555;\
        border-radius:8px; -webkit-border-radius:8px; -moz-border-radius:8px;\
        box-shadow:0px 0px 10px #888; -webkit-box-shadow:0px 0px 10px #888; -moz-box-shadow:0px 0px 10px #888'>\
        Đang in, xin chờ chút....</div>`);
      $('#printMessageBox').css('opacity', 444);

      $('#printMessageBox').delay(delayOpenTime).animate({
        opacity: 0
      }, 700, function() {
        $(this).remove();
        resolve(true);
      });
    });
  }
}
