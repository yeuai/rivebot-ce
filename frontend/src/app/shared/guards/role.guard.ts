import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '@app/services/common/auth/authentication.service';
import * as _ from 'lodash';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private logger: NGXLogger,
    private router: Router,
    private svAuth: AuthenticationService
  ) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      const currentUser = this.svAuth.currentUser;

      // Có role được định nghĩa trên route thì user phải có role đó
      if (!route.data.role) {
        return true;
      } else if (typeof route.data.role === 'string' && currentUser.Roles.includes(route.data.role)) {
        return true;
      } else if (_.some(route.data.role, x => currentUser.Roles.includes(x))) {
        return true;
      } else {
        this.logger.info('User không có quyền:', route.data.role);
        this.router.navigate(['/page-not-found'], {
          queryParams: {
            error: '403',
            accessUrl: state.url
          }
        });
        return false;
      }
  }
}
