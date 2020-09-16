import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest < any >, next: HttpHandler): Observable < HttpEvent < any >> {
    try {
      if (!request.headers.get('Authorization')) {
        // add authorization header with jwt token if available
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.access_token) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${currentUser.access_token}`
            }
          });
        }
      }
    } catch (err) {}
    // continue send request
    return next.handle(request);
  }
}
