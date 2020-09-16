import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import { getApiUrl } from '../../../environments/helpers';
import {User} from '../../models/user.model';

@Injectable()
export class UserService {
  private API_URL: string;

  constructor(private http: HttpClient) {
    this.API_URL = getApiUrl();
  }

  getAll() { return this.http.get<User[]>(`${this.API_URL}/users`); }

  getById(id: number) {
    return this.http.get(`${this.API_URL}/users/` + id);
  }

  register(user: User) {
    return this.http.post(`${this.API_URL}/users/register`, user);
  }

  update(user: User) {
    return this.http.put(`${this.API_URL}/users/` + user.id, user);
  }

  delete (id: number) {
    return this.http.delete(`${this.API_URL}/users/` + id);
  }
}
