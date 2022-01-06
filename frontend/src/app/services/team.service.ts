import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import {
  DeploymentLogInfo,
  SolrIndex,
  SuggestedSolrField,
  Team,
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
export class TeamService {

  private readonly baseUrl = 'api/v1';
  private readonly teamApiPath: string = 'team';
  private readonly userApiPath: string = 'user';
  private readonly solrIndexApiPath: string = 'solr-index';
  private readonly jsonHeader = new Headers({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {

  }

  listAllTeams(): Promise<Array<Team>> {
    return this.http
      .get<Team[]>(`${this.baseUrl}/${this.teamApiPath}`)
      .toPromise();
  }

  createTeam(name: string): Promise<ApiResult> {
    const body = JSON.stringify( { name: name });

    return this.http
      .put<ApiResult>(`${this.baseUrl}/${this.teamApiPath}`, body, httpOptions)
      .toPromise();
  }

  deleteTeam(id: string): Promise<ApiResult> {
    return this.http
      .delete<ApiResult>(`${this.baseUrl}/${this.teamApiPath}/${id}`)
      .toPromise();
  }

  getTeam(id: string): Promise<Team> {
    return this.http
      .get<Team>(`${this.baseUrl}/${this.teamApiPath}/${id}`)
      .toPromise();
  }

  updateTeam(team: Team) {
    const body = JSON.stringify( team);
    return this.http
      .post<ApiResult>(`${this.baseUrl}/${this.teamApiPath}/${team.id}`, body, httpOptions)
      .toPromise();
  }

  deleteUserFromTeam(userId: string, teamId: string) {
    return this.http
      .delete<string[]>(`${this.baseUrl}/${this.userApiPath}/${userId}/${this.teamApiPath}/${teamId}`)
      .toPromise();
  }

  lookupUserIdsByTeamId(id: string): Promise<Array<string>> {
    return this.http
      .get<string[]>(`${this.baseUrl}/${this.teamApiPath}/${id}/${this.userApiPath}`)
      .toPromise();
  }

  deleteSolrIndexFromTeam(solrIndexId: string, teamId: string) {
    return this.http
      .delete<string[]>(`${this.baseUrl}/${this.teamApiPath}/${teamId}/${this.solrIndexApiPath}/${solrIndexId}`)
      .toPromise();
  }

  lookupSolrIndexIdsByTeamId(id: string): Promise<Array<string>> {
    return this.http
      .get<string[]>(`${this.baseUrl}/${this.teamApiPath}/${id}/${this.solrIndexApiPath}`)
      .toPromise();
  }

  addSolrIndexToTeam(solrIndexId: string, teamId: string) {
    return this.http
      .put<ApiResult>(`${this.baseUrl}/${this.teamApiPath}/${teamId}/${this.solrIndexApiPath}/${solrIndexId}`, "{}", httpOptions)
      .toPromise();
  }

}
