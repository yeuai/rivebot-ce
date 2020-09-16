import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable } from 'rxjs';
import { getApiUrl } from '../../../environments/helpers';
import { AppConfigService } from './app-config.service';
import { AuthenticationService } from './auth/authentication.service';

interface NavAttributes {
  [propName: string]: any;
}
interface NavWrapper {
  attributes: NavAttributes;
  element: string;
}
interface NavBadge {
  text: string;
  variant: string;
}
interface NavLabel {
  class?: string;
  variant: string;
}

export interface MainMenuItems {
  state: string;
  name: string;
  type: string;
  icon: string;
  routerLink: string;
}

export interface Menu {
  name?: string;
  url?: string;
  icon?: string;
  badge?: NavBadge;
  title?: boolean;
  children?: Menu[];
  variant?: string;
  queryParams?: any;
  attributes?: NavAttributes;
  divider?: boolean;
  class?: string;
  label?: NavLabel;
  wrapper?: NavWrapper;

  // label: string;
  // main: MainMenuItems[];
}

@Injectable()
export class MenuService {

  public userMenuSubject: BehaviorSubject<Array<Menu>>;
  public userMenuInfo: Observable<Array<Menu>>;

  constructor(
    private logger: NGXLogger,
    private http: HttpClient,
    private auth: AuthenticationService,
    private svConfig: AppConfigService,
  ) {
    this.userMenuSubject = new BehaviorSubject<Array<Menu>>([]);
    this.userMenuInfo = this.userMenuSubject.asObservable();
    this.auth.observableUser.subscribe(async (user) => {

      if (!user) {
        // User chưa đăng nhập?
        this.logger.info('User không có menu!');
        return;
      }

      // https://bvungbuou.hosoyte.com/api/24279/client/roles/BacSyNoiTru
      this.logger.debug('User đăng nhập: ' + user.username + ', load lại menu người dùng!', user.token);

      const vUserMenu = new Array<Menu>();

      const role = _.find(user.Roles);
      const vRequestUrl = getApiUrl(this.svConfig.domain, 'client/roles', role);
      let vMenuResult = null;
      try {
        vMenuResult = await this.http.get<Array<any>>(vRequestUrl, {
          params: {
            sMaLoai: 'HSDT'
          }
        }).toPromise();
      } catch (error) {
        vMenuResult = null;
      }

      if (!vMenuResult || vMenuResult.length === 0) {
        this.logger.warn(`The role does not have menu: ${role}`);
        vUserMenu.push(
          {
            name: 'Dashboard',
            url: '/dashboard',
            icon: 'fa fa-list-alt',
            badge: {
              variant: 'info',
              text: ''
            }
          },
          {
            name: 'Agents',
            url: '/bot/Agents',
            icon: 'fa fa-list-alt',
            badge: {
              variant: 'info',
              text: 'New'
            }
          },
          {
            name: 'Scripts',
            url: '/bot/Scripts',
            icon: 'fa fa-list-alt',
            badge: {
              variant: 'info',
              text: ''
            }
          },
          {
            name: 'History',
            url: '/bot/history',
            icon: 'fa fa-list-alt',
            badge: {
              variant: 'info',
              text: ''
            }
          }
        );
        // continue;
      } else {
        // TODO: Remove duplicated menus
        // Ref: https://stackoverflow.com/a/31740263/1896897
        const vGroupMenu = _.groupBy(vMenuResult, 'Type');

        // tslint:disable-next-line:forin
        for (const group in vGroupMenu) {
          // vUserMenu.push({
          //   title: true,
          //   class: 'disable-select',
          //   name: gtype || group
          // });

          // duyệt các menu con + sắp xếp ưu tiên
          const sortedMenu = _.sortBy(vGroupMenu[group], 'UuTien');
          for (const m1 of sortedMenu) {
            if (!m1) {
              this.logger.warn(`Menu is null: group=${group}`);
              continue;
            } else if (m1.IsParent) {
              const vMenu = {
                name: m1.Text,
                class: 'disable-select',
                icon: 'fa ' + (m1.Icon || 'fa-list'),
                children: []
              };
              vUserMenu.push(vMenu);

              // children
              for (const m2 of m1.Children) {
                vMenu.children.push({
                  name: m2.Text,
                  icon: 'fa ' + (m2.Icon || 'fa-list'),
                  url: `/${m2.Controller}/${m2.Action}`,
                  queryParams: m2.Params ? JSON.parse(m2.Params) : null
                });
              }

            } else {
              // menu 1 tầng
              vUserMenu.push({
                name: m1.Text,
                icon: 'fa ' + (m1.Icon || 'fa-list'),
                url: `/${m1.Controller}/${m1.Action}`,
                queryParams: m1.Params ? JSON.parse(m1.Params) : null
              });
            }
          }
        }
      }


      this.logger.debug('User Role Menu: ', vUserMenu);
      this.userMenuSubject.next(vUserMenu);
    });
  }

  /**
   * Get system menu by user Role
   */
  getAll(): Observable<Array<Menu>> {
    return this.userMenuInfo;
  }
}
