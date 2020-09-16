import { Routes } from '@angular/router';

import { AuditlogComponent } from './auditlog/auditlog.component';
import { HtconfigComponent } from './htconfig/htconfig.component';
import { QuanTriComponent } from './quantri.component';
import { UserEditComponent } from './user/user-edit';
import { UserListComponent } from './user/user-list';
import { UserNewComponent } from './user/user-new';

export const QuanTriRoutes: Routes = [
  {
    path: '',
    component: QuanTriComponent,
    data: {
      breadcrumb: 'Quản trị',
      link: '/QuanTri'
    },
    children: [
      {
        path: '',
        redirectTo: 'adudit-log',
        pathMatch: 'full'
      }, {
        path: 'adudit-log',
        component: AuditlogComponent,
        data: {
          breadcrumb: 'Audit Log',
          title: 'Lịch sử hoạt động khám bệnh',
          link: '/QuanTri/adudit-log'
        }
      }, {
        path: 'htconfig',
        component: HtconfigComponent,
        data: {
          breadcrumb: 'HT Config',
          title: 'Cài đặt hệ thống',
          link: '/QuanTri/htconfig'
        }
      }, {
        path: 'user-home',
        component: UserListComponent,
        data: {
          breadcrumb: 'User List',
          title: 'Tài khoản người dùng',
          link: '/QuanTri/user-list'
        }
      }, {
        path: 'user-list',
        component: UserListComponent,
        data: {
          breadcrumb: 'User List',
          title: 'Tài khoản người dùng',
          link: '/QuanTri/user-list'
        }
      }, {
        path: 'user-edit',
        component: UserEditComponent,
        data: {
          breadcrumb: 'User Edit',
          title: 'Sửa tài khoản',
          link: '/QuanTri/user-edit'
        }
      }, {
        path: 'user-new',
        component: UserNewComponent,
        data: {
          breadcrumb: 'User New',
          title: 'Thêm mới tài khoản',
          link: '/QuanTri/user-new'
        }
      }
    ]
  }
];
