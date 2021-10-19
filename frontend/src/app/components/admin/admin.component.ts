import {Component, OnInit, Input, SimpleChanges} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { SolrIndex, Team, User } from '../../models';

import {
  SolrService,
  ModalService,
  TeamService,
  UserService
} from '../../services';

@Component({
  selector: 'app-smui-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  constructor(
    private modalService: ModalService,
    private toasterService: ToasterService,
    private solrService: SolrService,
    private teamService: TeamService,
    private userService: UserService

  ) {

  }

  solrIndices: SolrIndex[];
  teams: Team[];
  users: User[];

  ngOnInit() {
    console.log('In AdminComponent :: ngOnInit');
    this.solrIndices = this.solrService.solrIndices;
    this.lookupTeams();
    this.lookupUsers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('In AdminComponent :: ngOnChanges');
    this.lookupTeams();
    this.lookupUsers();
  }


  public showSuccessMsg(msgText: string) {
    this.toasterService.pop('success', '', msgText);
  }

  public showErrorMsg(msgText: string) {
    this.toasterService.pop('error', '', msgText);
  }


  // @ts-ignore
  public openDeleteConfirmModal({ deleteCallback }) {
    const deferred = this.modalService.open('confirm-delete');
    deferred.promise.then((isOk: boolean) => {
      if (isOk) { deleteCallback(); }
      this.modalService.close('confirm-delete');
    });
  }

  public solrIndicesChange( id: string){
    console.log("AdminComponent::solrIndicesChange")
    this.solrIndices = this.solrService.solrIndices;
  }

  public teamsChange( ){
    console.log("AdminComponent::teamsChange")
    this.teamService.listAllTeams().then(teams => this.teams = teams);
  }

  public usersChange( ){
    console.log("AdminComponent::usersChange")
    this.userService.listAllUsers().then(users => this.users = users);
  }

  lookupTeams() {
    console.log('In AdminComponent :: lookupTeams');
    this.teamService.listAllTeams()
      .then(teams => {
        this.teams = teams;
        console.log("FOUND SOME TEAMS" + teams.length);
      })
      .catch(error => this.showErrorMsg(error));
  }

  lookupUsers() {
    console.log('In AdminComponent :: lookupUsers');
    this.userService.listAllUsers()
      .then(users => {
        this.users = users;
        console.log("FOUND SOME USERS" + users.length);
      })
      .catch(error => this.showErrorMsg(error));
  }

  // @ts-ignore
  public openDeleteConfirmModal({ deleteCallback }) {
    const deferred = this.modalService.open('confirm-delete');
    deferred.promise.then((isOk: boolean) => {
      if (isOk) { deleteCallback(); }
      this.modalService.close('confirm-delete');
    });
  }

}
