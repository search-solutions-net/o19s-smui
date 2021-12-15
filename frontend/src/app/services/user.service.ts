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
  private readonly usersApiPath: string = 'user';
  private readonly jsonHeader = new Headers({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {

  }

  listAllUsers(): Promise<Array<User>> {
    return this.http
      .get<User[]>(`${this.baseUrl}/${this.usersApiPath}`)
      .toPromise();
  }

  createUser(name: string, email: string, password: string, admin: boolean): Promise<ApiResult> {
    const body = JSON.stringify( { name: name, email: email, password: password, admin:admin });

    return this.http
      .put<ApiResult>(`${this.baseUrl}/${this.usersApiPath}`, body, httpOptions)
      .toPromise();
  }

  deleteUser(id: string): Promise<ApiResult> {
    return this.http
      .delete<ApiResult>(`${this.baseUrl}/${this.usersApiPath}/${id}`)
      .toPromise();
  }
}
