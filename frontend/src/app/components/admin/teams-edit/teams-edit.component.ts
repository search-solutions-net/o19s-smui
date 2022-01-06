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
  ModalService
} from '../../../services';
import {ActivatedRoute, ParamMap} from "@angular/router";

@Component({
  selector: 'app-smui-admin-teams-edit',
  templateUrl: './teams-edit.component.html'
})
export class TeamsEditComponent implements OnInit, OnChanges {

  @Output() showSuccessMsg: EventEmitter<string> = new EventEmitter();
  @Output() teamChange: EventEmitter<string> = new EventEmitter();
  @Output() userChange: EventEmitter<string> = new EventEmitter();

  team: Team;
  teamUsers: User[];
  teamUserIds: string[];
  teamSolrIndices: SolrIndex[];
  teamSolrIndexIds: string[];
  nonTeamSolrIndices: SolrIndex[];
  addSolrIndexId: string;
  addUserEmail: string;

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
    private userService: UserService,
    private solrService: SolrService,
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('In TeamsEditComponent :: ngOnChanges');
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
              .then(() => {
                this.lookupTeamUsers();
                this.userChange.emit();
              })
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
    this.nonTeamSolrIndices = this.solrService.solrIndices.filter((solrIndex) => {
      return !teamSolrIndexIdsSet.has(solrIndex.id);
    });
  }

  lookupTeamSolrIndices() {
    this.teamService.lookupSolrIndexIdsByTeamId(this.team.id)
      .then(solrIndexIds => {
        this.teamSolrIndexIds = solrIndexIds;
        if (this.teamSolrIndexIds.length > 0) {
          this.solrService.listSolrIndices(solrIndexIds)
            .then(solrIndices => this.teamSolrIndices = solrIndices)
            .catch(error => this.showErrorMsg(error));
        } else {
          this.teamSolrIndices = [];
        }
        this.lookupNonTeamSolrIndices()
      })
      .catch(error => this.showErrorMsg(error));
  }

  deleteSolrIndexFromTeam(solrIndexId: string) {
    this.teamService.deleteSolrIndexFromTeam(solrIndexId, this.team.id)
      .then(() => this.lookupTeamSolrIndices())
      .catch(error => this.showErrorMsg(error));
  }

  addSolrIndexToTeam(solrIndexId: string){
    console.log('In TeamsEditComponent :: addSolrIndexToTeam ' + solrIndexId);
    if (solrIndexId != "DEFAULT") {
      this.teamService.addSolrIndexToTeam(solrIndexId, this.team.id)
        .then(() => this.lookupTeamSolrIndices())
        .catch(error => this.showErrorMsg(error));
      this.addSolrIndexId = "DEFAULT";
    }
  }

  updateTeam(){
    console.log('In TeamsEditComponent :: updateTeam');
    if (this.team.name) {
      this.teamService.updateTeam(this.team)
        .then(() => this.teamChange.emit())
        .then(() => this.showSuccessMsg.emit("Updated Team " + this.team.name))
        .catch(error => this.showErrorMsg(error));
    }
  }

  public showErrorMsg(msgText: string) {
    this.toasterService.pop('error', '', msgText);
  }



}
