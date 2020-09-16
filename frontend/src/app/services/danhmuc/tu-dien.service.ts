import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import { fromApiBaseUrl, getApiUrl } from '../../../environments/helpers';
import { DMTuDien } from '../../models/danhmuc/DMTuDien';

@Injectable({providedIn: 'root'})

export class TuDienService {
  private API_URL: string;

  constructor(private http: HttpClient) {
    this.API_URL = getApiUrl('tudiens/');
  }

  getAllByType(type: string): Promise<any> {
    return this.http.get<any[]>(this.API_URL, {
      params: {
        type
      }
    }).toPromise();
  }

  /**
   * Lấy các danh mục theo mã từ điển
   * @param type Mã từ điển (lấy nhiều cách nhau dấu phẩy)
   */
  getAllByTypes(type: string): Promise<any> {
    const vApiRequest = fromApiBaseUrl(this.API_URL, 'ShowAllByTypes');
    const typeValue = type.replace(/\s+/g, ''); // Normalize by remove whitespace, newline
    return  this.http.get<any[]>(vApiRequest, {
      params: {
        types: typeValue
      }
    })
    .toPromise();
  }

  /**
   * Lấy dm từ điển theo id
   * @param id
   */
  get(id: string|number): Promise<DMTuDien> {
    return  this.http.get<DMTuDien>(`${this.API_URL}/${id}`).toPromise();
  }

  getByName(type: string, name: string): Promise<DMTuDien> {
    return  this.http.get<DMTuDien>(this.API_URL + '/ShowByName', {
      params: {
        type,
        name
      }
    }).toPromise();
  }
}
