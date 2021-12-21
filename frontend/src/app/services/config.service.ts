import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {SmuiVersionInfo, UserInfo} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  versionInfo?: SmuiVersionInfo;
  userInfo?: UserInfo;
  private readonly baseUrl = 'api/v1';

  constructor(private http: HttpClient) { }

  getLatestVersionInfo(): Promise<void> {
    return this.http
      .get<SmuiVersionInfo>(this.baseUrl + '/version/latest-info')
      .toPromise()
      .then(versionInfo => {
        this.versionInfo = versionInfo;
      });
  }

  getCurrentUserInfo(): Promise<void> {
    return this.http
      .get<UserInfo>(this.baseUrl + '/session/user')
      .toPromise()
      .then(userInfo => {
        this.userInfo = userInfo;
      });
  }

  isAdminUser(): boolean {
    return this.userInfo === undefined || this.userInfo.admin
  }

}
