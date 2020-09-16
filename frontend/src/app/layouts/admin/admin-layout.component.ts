import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationEnd, NavigationError, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { AppConfigService } from '../../services/common/app-config.service';
import { AuthenticationService } from '../../services/common/auth/authentication.service';
import { MenuService } from '../../services/common/menu.service';
import { PhieuInService } from '../../services/common/phieu-in.service';
import { AppConfig } from '../../shared/types/app-config';


@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  MENU_ITEMS = [];
  APP_VERSION: string;
  API_VERSION: string;

  // show menu electron dev tool
  private subscription: Subscription;
  showElectronMenu: false;
  userInfo: User;
  tenKhoa: string;
  config: AppConfig;

  constructor(
    private router: Router,
    private logger: NGXLogger,
    private toaster: ToastrService,
    private svAuth: AuthenticationService,
    private svMenu: MenuService,
    private svConfig: AppConfigService,
    private svPhieuIn: PhieuInService,
    ) {
      this.API_VERSION = 'v3.2';
      this.config = this.svConfig.config;

      // Khởi tạo menu
      this.svMenu.getAll().subscribe((menus) => {
        this.MENU_ITEMS = menus;
        // this.logger.debug('Menu hệ thống theo role của người dùng', menus);
      });
  }

  /**
   * Khởi tạo menu hệ thống
   * Kiểm tra các thiết lập ban đầu
   */
  async ngOnInit() {
    try {
      this.subscription = this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd || event instanceof NavigationError) {
          // Fix & resize admin layout in case of css failure to reset the height or width of the content
          $('body').layout('fix');
        }
      });

      // this.MENU_ITEMS = this.svMenu.getAll();
      // this.MENU_ITEMS = MENU_ITEMS;
      this.userInfo = this.svAuth.currentUser;
      this.logger.debug('Menu hệ thống theo role của người dùng', this.MENU_ITEMS);

      if (this.userInfo === null) {
        throw new Error('Yêu cầu đăng nhập hệ thống!');
      }

      // Get thêm thông tin User, ...
      this.logger.debug(`Xin chào: ${this.userInfo.HoTen}, tài khoản: ${this.userInfo.username}!`);

      $('body').layout('fix');
    } catch (error) {
      this.userInfo = new User();
      this.logger.error('Lỗi khởi tạo Admin layout: ', error);
      this.toaster.error('error', 'Lỗi: ' + error && error.message);
    }
  }

  /**
   * Hủy các đăng ký
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Đăng xuất tài khoản người dùng
   */
  logout() {
    this.svAuth.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Mở Developer Console
   */
  openDeveloperTools() {
    // this.electron.openDeveloperTools();
  }

  /**
   * Mở thư mục ứng dụng
   */
  openAppFolder() {
    // const rootFolder = process.cwd();
    // this.electron.shell.showItemInFolder(rootFolder);
  }

  /**
   * Kiểm tra thông tin hệ thống
   */
  showAboutInfo() {
    // this.electron.showAboutDialog();
  }

  /**
   * Bật thông báo sử dụng Angular Notifier
   */
  showNotify() {
    this.toaster.info('info', 'Demo thông báo mới!');
  }

  /**
   * Test chức năng in
   */
  testPrint() {
    const obj = {
      name: 'Vunb'
    };

    this.svPhieuIn.print('TEMPLATE_NAME', obj);
  }
}
