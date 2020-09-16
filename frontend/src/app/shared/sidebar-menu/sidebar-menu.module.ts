import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppSidebarNavDividerComponent } from '@app/shared/sidebar-menu/components/app-sidebar-nav-divider.component';
import { AppSidebarNavDropdownComponent } from '@app/shared/sidebar-menu/components/app-sidebar-nav-dropdown.component';
import { AppSidebarNavItemsComponent } from '@app/shared/sidebar-menu/components/app-sidebar-nav-items.component';
import { AppSidebarNavLabelComponent } from '@app/shared/sidebar-menu/components/app-sidebar-nav-label.component';
import { AppSidebarNavLinkComponent } from '@app/shared/sidebar-menu/components/app-sidebar-nav-link.component';
import { AppSidebarNavTitleComponent } from '@app/shared/sidebar-menu/components/app-sidebar-nav-title.component';
import { HoSoSidebarMenuComponent } from '@app/shared/sidebar-menu/sidebar-menu.component';
import { HtmlAttributesDirective, NavDropdownDirective, NavDropdownToggleDirective } from '@app/shared/sidebar-menu/sidebar-menu.directive';
import { SidebarNavHelper } from '@app/shared/sidebar-menu/sidebar-menu.service';


/**
 * Custom Sidebar Menu - tùy chỉnh cho ứng dụng
 */
@NgModule({
  providers: [
    SidebarNavHelper
  ],
  declarations: [
    AppSidebarNavItemsComponent,
    AppSidebarNavDividerComponent,
    AppSidebarNavDropdownComponent,
    AppSidebarNavLabelComponent,
    AppSidebarNavLinkComponent,
    AppSidebarNavTitleComponent,
    HoSoSidebarMenuComponent,
    NavDropdownDirective,
    NavDropdownToggleDirective,
    HtmlAttributesDirective,
  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    HoSoSidebarMenuComponent
  ]
})
export class SidebarMenuModule { }
