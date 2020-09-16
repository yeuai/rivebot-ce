import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError, Observable } from 'rxjs';
import { delay, dematerialize, materialize, mergeMap } from 'rxjs/operators';

// import fake data
import * as _ from 'lodash';
import { UserFakeData } from '../data/fake-backend.data';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // array in local storage for registered users
    const users: any[] = JSON.parse(localStorage.getItem('users')) || [];

    // wrap in delayed observable to simulate server api call
    return of(null).pipe(mergeMap(() => {

      // authenticate
      if (request.url.endsWith('/users/authenticate') && request.method === 'POST') {
        // join demo users
        const vUsers = _(users).concat(UserFakeData).groupBy('id').map(_.spread(_.merge)).value();
        // find if any user matches login credentials
        const filteredUsers = vUsers.filter(user => {
          return user.username === request.body.username && user.password === request.body.password;
        });

        if (filteredUsers.length) {
          // if login details are valid return 200 OK with user details and fake jwt token
          const user = filteredUsers[0];
          const body = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            token: 'fake-jwt-token'
          };

          return of(new HttpResponse({ status: 200, body }));
        } else {
          // else return 400 bad request
          return throwError({
            error: {
              message: 'Username or password is incorrect'
            }
          });
        }
      }

      // get users
      if (request.url.endsWith('/users') && request.method === 'GET') {
        // check for fake auth token in header and return users if valid, this security
        // is implemented server side in a real application
        if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
          return of(new HttpResponse({ status: 200, body: users }));
        } else {
          // return 401 not authorised if token is null or invalid
          return throwError({
            status: 401,
            error: {
              message: 'Unauthorised'
            }
          });
        }
      }

      // get user by id
      if (request.url.match(/\/users\/\d+$/) && request.method === 'GET') {
        // check for fake auth token in header and return user if valid, this security
        // is implemented server side in a real application
        if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
          // find user by id in users array
          const urlParts = request
            .url
            .split('/');
          const id = parseInt(urlParts[urlParts.length - 1], 10);
          const matchedUsers = users.filter(item => item.id === id);
          const user = matchedUsers.length
            ? matchedUsers[0]
            : null;

          return of(new HttpResponse({ status: 200, body: user }));
        } else {
          // return 401 not authorised if token is null or invalid
          return throwError({
            status: 401,
            error: {
              message: 'Fake Unauthorised'
            }
          });
        }
      }

      // register user
      if (request.url.endsWith('/users/register') && request.method === 'POST') {
        // get new user object from post body
        const newUser = request.body;

        // validation
        const duplicateUser = users
          .filter(user => user.username === newUser.username)
          .length;
        if (duplicateUser) {
          return throwError({
            error: {
              message: 'Username "' + newUser.username + '" is already taken'
            }
          });
        }

        // save new user
        newUser.id = users.length + 1;
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // respond 200 OK
        return of(new HttpResponse({ status: 200 }));
      }

      // delete user
      if (request.url.match(/\/users\/\d+$/) && request.method === 'DELETE') {
        // check for fake auth token in header and return user if valid, this security
        // is implemented server side in a real application
        if (request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
          // find user by id in users array
          const urlParts = request
            .url
            .split('/');
          const id = parseInt(urlParts[urlParts.length - 1], 10);
          for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.id === id) {
              // delete user
              users.splice(i, 1);
              localStorage.setItem('users', JSON.stringify(users));
              break;
            }
          }

          // respond 200 OK
          return of(new HttpResponse({ status: 200 }));
        } else {
          // return 401 not authorised if token is null or invalid
          return throwError({
            status: 401,
            error: {
              message: 'Unauthorised'
            }
          });
        }
      }

      // pass through any requests not handled above
      return next.handle(request);

    }))

      // call materialize and dematerialize to ensure delay even if an error is thrown
      // ref: https://github.com/Reactive-Extensions/RxJS/issues/648
      .pipe(materialize())
      .pipe(delay(500))
      .pipe(dematerialize());
  }
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
