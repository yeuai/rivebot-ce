import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

import { AppConfig } from '@app/shared/types/app-config';
import { getApiUrl } from '@env/helpers';
import { AuthenticationService } from './auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private APP_CONFIG: AppConfig;

  constructor(
    private logger: NGXLogger,
    private http: HttpClient,
    private auth: AuthenticationService
  ) {

    // Trường hợp User đăng xuất, đăng nhập vào tài khoản khác
    // Hoặc là người dùng đăng nhập mới, cần nạp lại cấu hình hệ thống
    this.auth.loginActionSubject.subscribe((isLogin) => {
      if (isLogin) {
        this.logger.info(`New login: ${this.user.username} -> Reloading config ...`);
        this.loadConfig().then((config) => {
          this.logger.debug('Reload user config done!', config);
        });
      }
    });
  }

  /**
   * Lấy cấu hình hệ thống HTClient config.
   */
  public get config(): AppConfig {
    return this.APP_CONFIG || ({} as AppConfig);
  }

  /**
   * Lấy thông tin người dùng hiện tại
   */
  public get user() {
    return this.auth.currentUser;
  }

  public get domain() {
    if (!this.auth.currentUser) {
      return '';
    }
    return this.auth.currentUser.Domain;
  }

  /**
   * Lấy danh sách cấu hình hệ thống
   * Note: This is loaded first at time that our application start
   */
  async loadConfig() {
    try {

      if (this.auth.currentUser == null) {
        this.logger.info('Required user login first!');
        return null;
      } else if (this.auth.currentUser.Domain == null) {
        return this.logger.warn('Unknow user domain! Please log-out then login again.');
      }

      // Preparing send request
      const vRequestUrl = getApiUrl('HTClient', this.domain, 'config');
      this.APP_CONFIG = await this.http.get<AppConfig>(vRequestUrl).toPromise();
      return this.APP_CONFIG;
    } catch (error) {
      this.logger.error('Không nạp được cấu hình ứng dụng!', error);
    }
  }
}
