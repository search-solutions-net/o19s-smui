import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import {SolrIndex, Team, User} from '../../../models';
import {
  TeamService,
  UserService,
  SolrService,
  ConfigService,
  ModalService
} from '../../../services';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";

@Component({
  selector: 'app-smui-admin-teams-edit',
  templateUrl: './teams-edit.component.html'
})
export class TeamsEditComponent implements OnInit, OnChanges {

  @Output() teamChange: EventEmitter<string> = new EventEmitter();
  @Output() userChange: EventEmitter<string> = new EventEmitter();
  @Output() addSolrIndexIdChange: EventEmitter<string> = new EventEmitter();
  @Output() addUserEmailChange: EventEmitter<string> = new EventEmitter();

  team: Team;
  teamUsers: User[];
  teamUserIds: string[];
  adminSolrIndices: SolrIndex[];
  teamSolrIndices: SolrIndex[];
  teamSolrIndexIds: string[];
  nonTeamSolrIndices: SolrIndex[];
  addSolrIndexId: string;
  addUserEmail: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private userService: UserService,
    private solrService: SolrService,
    private configService: ConfigService,
    private toasterService: ToasterService
  ) {

  }

  ngOnInit() {
    console.log('In TeamsEditComponent :: ngOnInit');
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.teamService.getTeam(params.get("teamId")!)
        .then(team => {
            this.team = team;
            this.lookupTeamUsers();
            this.lookupTeamSolrIndices();
          }
        )
        .catch(error => this.showErrorMsg(error));
    })
    this.addSolrIndexId = "DEFAULT";
    this.solrService.listSolrIndices([], true)
      .then(solrIndices => this.adminSolrIndices = solrIndices)
      .catch(error => this.showErrorMsg(error));
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('In TeamsEditComponent :: ngOnChanges');
  }

  public showSuccessMsg(msgText: string) {
    this.toasterService.pop('success', '', msgText);
  }

  public showErrorMsg(msgText: string) {
    this.toasterService.pop('error', '', msgText);
  }

  verifyRefreshUserSolrIndices(updatedUserId: string) {
    var isUpdateForCurrentUser =
      updatedUserId.length == 0 ?
        this.configService.authInfo && this.configService.authInfo.teams.includes(this.team.id) :
        this.configService.authInfo && this.configService.authInfo.currentUser.id == updatedUserId;
    console.log('isUpdateForCurrentUser: ' + isUpdateForCurrentUser)
    if (isUpdateForCurrentUser) {
      this.configService.getAuthInfo()
        .then(() => this.solrService.refreshSolrIndicesByIds(this.configService.getAuthSolrIndices()))
        .then(() => window.location.reload())
        .catch(error => this.showErrorMsg(error));
    }
  }

  lookupTeamUsers() {
    this.teamService.lookupUserIdsByTeamId(this.team.id)
      .then(userids => {
        this.teamUserIds = userids;
        this.userService.listUsers(userids)
          .then(users => this.teamUsers = users)
          .catch(error => this.showErrorMsg(error));
      })
      .catch(error => this.showErrorMsg(error));
  }

  deleteUserFromTeam(userId: string) {
    this.teamService.deleteUserFromTeam(userId, this.team.id)
      .then(() => this.lookupTeamUsers())
      .then(() => this.userChange.emit())
      .then(() => this.showSuccessMsg('User removed from team'))
      .then(() => this.verifyRefreshUserSolrIndices(userId))
      .catch(error => this.showErrorMsg(error));
  }

  addUserEmailToTeam(email: string){
    this.userService.lookupUserByEmail(email)
      .then(user => {
        if (!user) {
          this.showErrorMsg("No user found for that email address!")
        } else {
          if (!this.teamUserIds.includes(user.id)) {
            this.userService.addUserIdToTeam(user.id, this.team.id)
              .then(() => this.lookupTeamUsers())
              .then(() => this.userChange.emit())
              .then(() => this.showSuccessMsg("Added user to team"))
              .then(() => this.verifyRefreshUserSolrIndices(user.id))
              .catch(error => this.showErrorMsg(error));
          } else {
            this.showErrorMsg("email already assigned to team!")
          }
          this.addUserEmail = "";
        }
      })
      .catch(error => this.showErrorMsg(error));
  }

  lookupNonTeamSolrIndices() {
    const teamSolrIndexIdsSet = new Set(this.teamSolrIndexIds);
    this.nonTeamSolrIndices = this.adminSolrIndices.filter((solrIndex) => {
        return !teamSolrIndexIdsSet.has(solrIndex.id);
      });
  }

  lookupTeamSolrIndices() {
    this.teamSolrIndices = [];
    this.teamService.lookupSolrIndexIdsByTeamId(this.team.id)
      .then(solrIndexIds => {
        this.teamSolrIndexIds = solrIndexIds;
        if (this.teamSolrIndexIds.length > 0) {
          this.solrService.listSolrIndices(solrIndexIds, true)
            .then(solrIndices => this.teamSolrIndices = solrIndices)
            .catch(error => this.showErrorMsg(error));
        }
        this.lookupNonTeamSolrIndices()
      })
      .catch(error => this.showErrorMsg(error));
  }

  deleteSolrIndexFromTeam(solrIndexId: string) {
    this.teamService.deleteSolrIndexFromTeam(solrIndexId, this.team.id)
      .then(() => this.lookupTeamSolrIndices())
      .then(() => this.showSuccessMsg("Rules collection removed from team"))
      .then(() => this.verifyRefreshUserSolrIndices(''))
      .catch(error => this.showErrorMsg(error));
  }

  addSolrIndexToTeam(solrIndexId: string){
    console.log('In TeamsEditComponent :: addSolrIndexToTeam ' + solrIndexId);
    if (solrIndexId != "DEFAULT") {
      this.teamService.addSolrIndexToTeam(solrIndexId, this.team.id)
        .then(() => this.lookupTeamSolrIndices())
        .then(() => this.showSuccessMsg("Added rules collection to team"))
        .then(() => this.verifyRefreshUserSolrIndices(''))
        .catch(error => this.showErrorMsg(error));
      this.addSolrIndexId = "DEFAULT";
    }
  }

  updateTeam(){
    console.log('In TeamsEditComponent :: updateTeam');
    if (this.team.name) {
      this.teamService.updateTeam(this.team)
        .then(() => this.teamChange.emit())
        .then(() => this.showSuccessMsg("Updated team"))
        .catch(error => this.showErrorMsg(error));
    }
  }

}
