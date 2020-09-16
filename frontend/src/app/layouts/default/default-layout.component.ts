import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { NGXLogger } from 'ngx-logger';
import { User } from '../../models/user.model';
import { AppConfigService } from '../../services/common/app-config.service';
import { AuthenticationService } from '../../services/common/auth/authentication.service';
import { Menu, MenuService } from '../../services/common/menu.service';
import { AppConfig } from '../../shared/types/app-config';

@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styles: [`
  :host {
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    min-height: 100vh;
  }`]
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {
  APP_VERSION: string;
  API_VERSION: string;

  // show menu electron dev tool
  showElectronMenu = false;
  userInfo: User;
  tenKhoa: string;
  config: AppConfig;
  urlHis: string;
  navMenuItems: Array<Menu>;
  sidebarMinimized = true;
  element: HTMLElement;
  private changes: MutationObserver;

  constructor
(
    @Inject(DOCUMENT) _document: any,
    private router: Router,
    private logger: NGXLogger,
    private svAuth: AuthenticationService,
    private svMenu: MenuService,
    private svConfig: AppConfigService,
  ) {
    this.urlHis = environment.baseUrl;
    this.API_VERSION = window._appversion;
    // this.APP_VERSION = this.electron.getVersion();
    this.config = this.svConfig.config;
    this.navMenuItems = [];

    this.changes = new MutationObserver((mutations) => {
      this.sidebarMinimized = _document.body.classList.contains('sidebar-minimized');
    });
    this.element = _document.body;
    this.changes.observe( this.element as Element, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Khởi tạo menu
    this.svMenu.getAll().subscribe((menus) => {
      this.navMenuItems = menus;
      // this.logger.debug('Menu hệ thống theo role của người dùng', menus);
    });
  }

  /**
   * Khởi tạo menu hệ thống
   * Kiểm tra các thiết lập ban đầu
   */
  async ngOnInit() {
    try {
      // this.navItems = this.svMenu.getAll();
      this.userInfo = this.svAuth.currentUser;
      // TODO: Get thêm thông tin user.
      this.logger.debug(`Xin chào: ${this.userInfo.HoTen}, tài khoản: ${this.userInfo.username}!`);

    } catch (error) {
      this.logger.error('Lỗi khởi tạo Admin layout: ', error);
    }
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }

  /**
   * Đăng xuất tài khoản người dùng
   */
  logout() {
    this.svAuth.logout();
    this.router.navigate(['/login']);
  }

}
