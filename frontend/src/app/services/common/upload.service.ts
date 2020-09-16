import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { fromApiBaseUrl, getApiUrl } from '../../../environments/helpers';
import { AppConfigService } from '../common/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private API_URL: string;
  constructor(
    private http: HttpClient,
    private svConfig: AppConfigService
  ) {
    this.API_URL = getApiUrl(this.svConfig.domain, 'upload');
  }

  upload(dsFiles: any, idPhieu: string): Promise<any> {
    return this.http.put<any> (this.API_URL, {
      imageData: dsFiles,
      fileName: idPhieu + '.png'
    }).toPromise();
  }
}
