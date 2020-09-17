import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as jwt_decode from 'jwt-decode';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '@app/models/user.model';
import { environment, APP_SETTINGS } from '@env/environment';

/**
 * Service quản lý xác thực và kiểm duyệt phân quyền
 * Note: Service này (nên) không phụ thuộc vào các service (#) trong hệ thống
 */
@Injectable()
export class AuthenticationService {
  private LOGIN_URL: string;

  public loginActionSubject: BehaviorSubject<boolean>;
  public currentUserSubject: BehaviorSubject<User>;
  public currentUserInfo: Observable<User>;

  /**
   * Lưu ý AuthService độc lập & không phụ thuộc vào AppService khác
   * @param http
   * @param logger
   */
  constructor(private http: HttpClient, private logger: NGXLogger) {
    const vUser = User.fromJSON(localStorage.getItem('currentUser'));
    this.loginActionSubject = new BehaviorSubject(false);
    this.currentUserSubject = new BehaviorSubject<User>(vUser);
    this.currentUserInfo = this.currentUserSubject.asObservable();
    this.LOGIN_URL = APP_SETTINGS.ApiUrlAuth || '/oauth/token';
  }

  /**
   * Lấy thông tin người dùng hiện tại
   */
  public get currentUser(): User { return this.currentUserSubject.value; }

  /**
   * Tracking login / logout
   */
  public get observableUser(): Observable<User> { return this.currentUserInfo; }

  /**
   * Login for valid user
   * @param username
   * @param password
   */
  login(username: string, password: string) {
    const body = new HttpParams({
      fromObject: {
        username,
        password,
        grant_type: 'password',
        client_id: environment.client_id,
        client_secret: environment.client_secret
      }
    });

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        // 'Authorization': 'Basic ' + btoa('yourClientId' + ':' +
        // 'yourClientSecret')
      })
    };

    return this.http.post<User>(this.LOGIN_URL, body, httpOptions)
      .pipe(map(user => {
        // login successful if there's a jwt token in the response
        if (user && user.access_token) {
          // store user details and jwt token in local storage to keep user
          // logged in between page refreshes
          user.token = jwt_decode(user.access_token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          user = User.from(user);
          this.currentUserSubject.next(user);
          this.loginActionSubject.next(true);
          this.logger.info('User login success!');
        }

        return user;
      }));
  }

  /**
   * Log user out
   */
  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Token hết hạn chưa
   * @param expires
   */
  isTokenExpired(expires: Date): boolean {
    return (expires.valueOf() < new Date().valueOf());
  }

  /**
   * Tài khoản đã được xác thực hay chưa
   */
  isAuthenticated(): boolean {
    const vUser = this.currentUser;
    if (vUser == null || vUser.token == null) {
      return false;
    }
    const exp = new Date(0);
    exp.setUTCSeconds(vUser.token.exp);
    return !this.isTokenExpired(exp);
  }

  /**
   * Tài khoản có quyền hay không
   * Được sử dụng và check trong Guards
   * @param allowedRoles
   */
  isAuthorized(allowedRoles: string[] | null): boolean {
    // check if the list of allowed roles is empty, if empty, authorize the user
    // to access the page
    if (allowedRoles == null || allowedRoles.length === 0) {
      return true;
    }

    // get token from local storage or state management
    const token = this.currentUser.token;

    // check if it was decoded successfully, if not the token is not valid, deny
    // access
    if (!token || !token.role) {
      this.logger.error('Invalid token');
      return false;
    }

    let userRoles = [];
    if (typeof token.role === 'string') {
      userRoles = [token.role];
    } else {
      userRoles = token.role;
    }

    // check if the user roles is in the list of allowed roles, return true if
    // allowed and false if not allowed
    return userRoles.some(x => allowedRoles.includes(x));
  }
}
