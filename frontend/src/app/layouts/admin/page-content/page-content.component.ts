import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppConfigService } from '../../../services/common/app-config.service';

@Component({
  selector: 'app-page-content,[app-page-content]',
  templateUrl: './page-content.component.html',
  styleUrls: ['./page-content.component.scss']
})
export class PageContentComponent implements OnInit {

  title = 'Page Header';
  description = '';
  breadcrumbs: Array<Object>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appTitle: Title,
    private svConfig: AppConfigService
  ) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event) => {
      this.breadcrumbs = [];
      let currentRoute = this.route.root;
      let url = '';

      do {
        const childrenRoutes = currentRoute.children;
        currentRoute = null;
        childrenRoutes.forEach(routes => {
          if (routes.outlet === 'primary') {
            const routeSnapshot = routes.snapshot;
            url += '/' + routeSnapshot.url.map(segment => segment.path).join('/');
            this.title = routeSnapshot.data.title;
            this.description = routeSnapshot.data.description;

            if (routes.snapshot.data.breadcrumb !== undefined) {
              this.breadcrumbs.push({
                label: routes.snapshot.data.breadcrumb,
                link: routes.snapshot.data.link
              });
            }
            currentRoute = routes;
          }
        });
      } while (currentRoute);

      // set browser title
      if (!this.title) {
        this.appTitle.setTitle(`Quản lý khám sức khỏe - ${this.svConfig.config.TenBenhVien}`);
      } else {
        this.appTitle.setTitle(`${this.title} - ${this.svConfig.config.TenBenhVien}`);
      }
    });
  }

  ngOnInit() {
  }

}
