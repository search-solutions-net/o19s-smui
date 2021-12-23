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
  private readonly teamsApiPath: string = 'team';
  private readonly jsonHeader = new Headers({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {

  }

  listAllTeams(): Promise<Array<Team>> {
    return this.http
      .get<Team[]>(`${this.baseUrl}/${this.teamsApiPath}`)
      .toPromise();
  }

  createTeam(name: string): Promise<ApiResult> {
    const body = JSON.stringify( { name: name });

    return this.http
      .put<ApiResult>(`${this.baseUrl}/${this.teamsApiPath}`, body, httpOptions)
      .toPromise();
  }

  deleteTeam(id: string): Promise<ApiResult> {
    return this.http
      .delete<ApiResult>(`${this.baseUrl}/${this.teamsApiPath}/${id}`)
      .toPromise();
  }

  getTeam(id: string): Promise<Team> {
    console.log("about to getTeam")
    return this.http
      .get<Team>(`${this.baseUrl}/${this.teamsApiPath}/${id}`)
      .toPromise();
  }

  updateTeam(team: Team) {
    const body = JSON.stringify( team);
    return this.http
      .post<ApiResult>(`${this.baseUrl}/${this.teamsApiPath}/${team.id}`, body, httpOptions)
      .toPromise();
  }

  lookupUserIdsByTeamId(id: string): Promise<Array<string>> {
    console.log("About to actually call the /user end point for teams")
    return this.http
      .get<string[]>(`${this.baseUrl}/${this.teamsApiPath}/${id}/user`)
      .toPromise();
  }
}
