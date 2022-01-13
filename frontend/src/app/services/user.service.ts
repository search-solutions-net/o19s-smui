import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import {
  DeploymentLogInfo,
  SolrIndex,
  SuggestedSolrField,
  User,
  ApiResult
} from '../models';
import { Subject } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly baseUrl = 'api/v1';
  private readonly userApiPath: string = 'user';
  private readonly teamApiPath: string = 'team';
  private readonly lookupApiPath: string = 'lookup';
  private readonly lookupEmailApiPath: string = 'email';
  private readonly loginUrl: string = 'auth-login';
  private readonly logoutUrl: string = 'auth-logout';
  private readonly jsonHeader = new Headers({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {

  }

  listAllUsers(): Promise<Array<User>> {
    return this.http
      .get<User[]>(`${this.baseUrl}/${this.userApiPath}`)
      .toPromise();
  }

  listUsers(ids: string[]): Promise<Array<User>> {
    var queryParams = '';
    if (ids.length > 0) {
      ids.forEach(s => queryParams += '&id=' + s)
    } else {
      queryParams += 'id=N/A' // hack to ensure that selection on ids is active
    }
    if (queryParams.startsWith('&')) {
      queryParams = queryParams.substr(1)
    }
    queryParams = '?' + queryParams;
    return this.http
      .get<User[]>(`${this.baseUrl}/${this.userApiPath}${queryParams}`)
      .toPromise();
  }

  lookupUserByEmail(email: string): Promise<User> {
    return this.http
      .get<User>(`${this.baseUrl}/${this.userApiPath}/${this.lookupApiPath}/${this.lookupEmailApiPath}/${email}`)
      .toPromise();
  }

  addUserIdToTeam(userId: string, teamId: string) {
    return this.http
      .put<ApiResult>(`${this.baseUrl}/${this.userApiPath}/${userId}/${this.teamApiPath}/${teamId}`, "{}", httpOptions)
      .toPromise();
  }

  createUser(name: string, email: string, password: string, admin: boolean, passwordChangeRequired: boolean | null): Promise<User> {
    const body = JSON.stringify( { name: name, email: email, password: password, admin:admin, passwordChangeRequired: passwordChangeRequired});
    return this.http
      .put<User>(`${this.baseUrl}/${this.userApiPath}`, body, httpOptions)
      .toPromise();
  }

  updateUser(id: string, name: string, email: string, password: string | null, admin: boolean, passwordChangeRequired: boolean | null): Promise<User> {
    const body = JSON.stringify( { id: id, name: name, email: email, password: password, admin:admin, passwordChangeRequired: passwordChangeRequired});
    return this.http
      .post<User>(`${this.baseUrl}/${this.userApiPath}/${id}`, body, httpOptions)
      .toPromise();
  }

  deleteUser(id: string): Promise<ApiResult> {
    return this.http
      .delete<ApiResult>(`${this.baseUrl}/${this.userApiPath}/${id}`)
      .toPromise();
  }

  login(email: string, password: string): Promise<User> {
    let map = new Map<string, string>()
    map.set('email', email);
    map.set('password', password);
    let jsonObject = {};
    map.forEach((value, key) => {
      // @ts-ignore
      jsonObject[key] = value
    });
    return this.http
      .post<User>(`${this.baseUrl}/${this.loginUrl}`, JSON.stringify(jsonObject), httpOptions)
      .toPromise();
  }

  logout(): Promise<ApiResult> {
    return this.http
      .get<ApiResult>(`${this.baseUrl}/${this.logoutUrl}`)
      .toPromise();
  }

}
