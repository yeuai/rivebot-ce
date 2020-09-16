import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuditlogComponent } from './auditlog/auditlog.component';
import { HtconfigComponent } from './htconfig/htconfig.component';
import { MenuEditComponent } from './menu/menu-edit/menu-edit.component';
import { MenuListComponent } from './menu/menu-list/menu-list.component';
import { MenuNewComponent } from './menu/menu-new/menu-new.component';
import { OAuthClientComponent } from './oauth/oauth-client.component';
import { QuanTriComponent } from './quantri.component';
import { QuanTriRoutes } from './quantri.routing';
import { UserEditComponent } from './user/user-edit';
import { UserHomeComponent } from './user/user-home';
import { UserListComponent } from './user/user-list';
import { UserNewComponent } from './user/user-new';

/**
 * Phân hệ quản trị bệnh viện
 */
@NgModule({
  declarations: [
    QuanTriComponent,
    AuditlogComponent,
    UserHomeComponent,
    UserListComponent,
    UserEditComponent,
    UserNewComponent,
    HtconfigComponent,
    MenuListComponent,
    MenuEditComponent,
    MenuNewComponent,
    OAuthClientComponent
  ],
  imports: [
    CommonModule,
    // NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    // NgxPaginationModule,
    RouterModule.forChild(QuanTriRoutes)

  ]
})
export class QuanTriModule { }
