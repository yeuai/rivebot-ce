import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'hoso-viewport-layout',
  templateUrl: './viewport-layout.component.html',
  styleUrls: ['./viewport-layout.component.scss']
})
export class HoSoViewportLayoutComponent implements OnInit {

  returnUrl: string;

  constructor
  (
    private logger: NGXLogger,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.logger.info('Hồ sơ Viewport!');

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }
}
