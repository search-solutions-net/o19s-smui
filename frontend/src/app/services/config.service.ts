import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {SmuiVersionInfo, AuthInfoModel} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  versionInfo?: SmuiVersionInfo;
  authInfo: AuthInfoModel;
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

  getAuthInfo(): Promise<void> {
    return this.http
      .get<AuthInfoModel>(this.baseUrl + '/auth-info')
      .toPromise()
      .then(auth => {
        this.authInfo = auth;
      });
  }

  getAuthSolrIndices(): string[] {
    return this.authInfo !== undefined ? this.authInfo.solrIndices : [];
  }

  isLoginRequired(): boolean {
    return this.authInfo !== undefined && this.authInfo.isLoginRequired
  }

  isLoggedIn(): boolean {
    return  !this.isLoginRequired() || (this.authInfo !== undefined && this.authInfo.isLoggedIn)
  }

  isPasswordChangeRequired(): boolean {
    return  this.isLoggedIn() && this.authInfo !== undefined && this.authInfo.isPasswordChangeRequired
  }

  isAdminUser(): boolean {
    return this.authInfo !== undefined && this.authInfo.currentUser.admin
  }

}
