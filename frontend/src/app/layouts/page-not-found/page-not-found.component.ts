import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

  error: string;
  accessUrl: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logger: NGXLogger
  ) { }

  ngOnInit() {
    this.logger.info('Page not found: ', this.router.url);
    this.accessUrl = this.route.snapshot.queryParams['accessUrl'] || '/';
    this.error = this.route.snapshot.queryParams['error'] || '404';
  }

}
