import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import { AuthenticationService } from '@app/services/common/auth/authentication.service';
import {throwError, Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private svAuth: AuthenticationService) {}

  intercept(request: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (err.status === 401) {
        // auto logout if 401 response returned from api
        this.svAuth.logout();
        location.reload(true);
      }

      // error dissection
      let error = err.statusText;

      if (err.error != null) {
        const info = err.error;
        error = info.Message || info.error_description || `${err.status} ${err.statusText}`;
      }

      return throwError(error);
    }));
  }
}
