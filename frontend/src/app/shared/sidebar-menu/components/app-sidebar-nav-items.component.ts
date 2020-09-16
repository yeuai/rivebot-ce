import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { SidebarNavHelper } from '../sidebar-menu.service';

@Component({
  selector: 'app-sidebar-nav-items',
  templateUrl: `./app-sidebar-nav-items.component.html`
})
export class AppSidebarNavItemsComponent {
  @Input() items: Array<any>;
  constructor(
    public router: Router,
    public helper: SidebarNavHelper
  ) { }
}
