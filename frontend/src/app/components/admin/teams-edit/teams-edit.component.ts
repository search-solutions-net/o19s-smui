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
  ModalService
} from '../../../services';
import {ActivatedRoute, ParamMap} from "@angular/router";

@Component({
  selector: 'app-smui-admin-teams-edit',
  templateUrl: './teams-edit.component.html'
})
export class TeamsEditComponent implements OnInit, OnChanges {


  // why aren't we using this?
  //@Output() showErrorMsg: EventEmitter<string> = new EventEmitter();
  @Output() showSuccessMsg: EventEmitter<string> = new EventEmitter();
  //@Output() refreshRulesCollectionList: EventEmitter<string> = new EventEmitter();
  @Output() teamsChange: EventEmitter<string> = new EventEmitter();

  solrIndices: SolrIndex[];
  team: Team;
  users: User[];
  teamUserIds: string[];

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
    private userService: UserService,
    private toasterService: ToasterService
  ) {

  }
  ngOnInit() {
    console.log('In TeamsEditComponent :: ngOnInit');

    this.lookupUsers();
    //this.lookupTeamUsers();

    this.route.paramMap.subscribe((params: ParamMap) => {
      console.log(params);
      console.log(params.get("teamId")!.toLowerCase());
      this.teamService.getTeam(params.get("teamId")!.toLowerCase())
        .then(team => {
            this.team = team;
            this.lookupTeamUsers();
          }
        )
        .catch(error => this.showErrorMsg(error));


    })

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('In TeamsEditComponent :: ngOnChanges');
  }

  lookupUsers() {
    console.log('In TeamsEditComponent :: lookupUsers');
    this.userService.listAllUsers()
      .then(users => {
        this.users = users;
        console.log("FOUND SOME lookupUsers" + users.length);
      })
      .catch(error => this.showErrorMsg(error));
  }

  determineIfUserMemberOfTeam(userId: string): boolean {
    console.log("userid:" + userId);
    console.log(this.teamUserIds);
    return true;
    //return this.teamUserIds.includes(userId);
  }

  lookupTeamUsers() {
    console.log('In TeamsEditComponent :: lookupTeamUsers');
    this.teamService.lookupUserIdsByTeamId(this.team.id)
      .then(userids => {
        this.teamUserIds = userids;
        console.log("FOUND SOME lookupTeamUsers IDS" + userids.length);
      })
      .catch(error => this.showErrorMsg(error));
  }


  clearForm() {
    //this.name = '';
  }

  updateTeam( event: Event){
    console.log('In TeamsEditComponent :: updateTeam');
    console.log(this.team);
    if (this.team.name) {
      this.teamService.updateTeam(this.team)
        .then(() => this.teamsChange.emit())
        .then(() => this.showSuccessMsg.emit("Updated Team " + this.team.name))
        .then(() => this.clearForm())
        .catch(error => this.showErrorMsg(error));
    }
  }

  public showErrorMsg(msgText: string) {
    this.toasterService.pop('error', '', msgText);
  }



}
