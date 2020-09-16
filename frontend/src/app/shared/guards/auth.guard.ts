import { Injectable } from '@angular/core';
import { CanActivateChild, Router } from '@angular/router';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '@app/services/common/auth/authentication.service';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private logger: NGXLogger,
    private router: Router,
    private svAuth: AuthenticationService
  ) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      const currentUser = this.svAuth.currentUser;
      if (currentUser) {
        return true;
      }

      this.logger.debug('Yêu cầu user đăng nhập!');
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: state.url
        }
      });
      return false;
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const currentUser = this.svAuth.currentUser;
    if (currentUser) {
      return true;
    }

    this.logger.debug('childRoute -> Yêu cầu user đăng nhập!');
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: state.url
      }
    });
    return false;
  }

}
