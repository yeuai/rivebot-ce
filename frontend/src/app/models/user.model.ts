import * as _ from 'lodash';

type UserRole = string | Array<string>;
type UserMenu = string | Array<string>;

interface UserToken {
  [key: string]: any;
  domain: string;
  aud: string;
  exp: number;
  nbf: number;
  iss: string;
  menu: UserMenu;
  role: UserRole;
}

export class User {
  id: string;
  username: string;
  password: string;
  token_type?: string;
  access_token?: string;
  refresh_token?: string;
  token?: UserToken; // decoded token

  // additional info
  FirstName?: string;
  LastName?: string;
  HoTen?: string;
  ChuKy?: string;
  CCHN?: string;
  Domain?: string;
  Email?: string;
  AvatarUrl?: string;
  IdKho?: string;
  IdPhong?: string;
  IdKhoa?: string;
  IdDonVi?: string;
  IdLoaiTaiKhoan?: string;
  IdGroup?: string;
  IdNodes?: string;
  ListIdKhoa?: string;

  static fromJSON(info: string): User {
    if (info === null) {
      return null;
    }

    try {
      const data = JSON.parse(info);
      const user = new User();
      return _.extend(user, data);
    } catch {
      return null;
    }
  }

  static from(info: object): User {
    return _.extend(new User(), info);
  }

  // Thông tin mở rộng
  get Roles(): string[] {
    if (this.token == null || this.token.role == null) {
      return [];
    } else if (typeof this.token.role === 'string') {
      return [this.token.role];
    } else {
      return this.token.role;
    }
  }
}
