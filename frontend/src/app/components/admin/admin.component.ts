import {Component, OnInit, Input, SimpleChanges} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import {ApiResult, SolrIndex, Team, User} from '../../models';

import {
  SolrService,
  ModalService,
  TeamService,
  UserService, ConfigService
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
    private userService: UserService,
    private configService: ConfigService

  ) {

  }

  isAdminUser: boolean;
  adminSolrIndices: SolrIndex[];
  teams: Team[];
  users: User[];
  currentUser: User;

  ngOnInit() {
    console.log('In AdminComponent :: ngOnInit');
    this.isAdminUser = this.configService.isAdminUser();
    this.currentUser = this.configService.getCurrentUser();
    this.solrService.listAllSolrIndices()
      .then(solrIndices => this.adminSolrIndices = solrIndices)
      .catch(error => this.showApiErrorMsg(error.error));
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

  public showApiErrorMsg(error: ApiResult) {
    this.showErrorMsg(error.message);
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
    this.solrService.listAllSolrIndices()
      .then(solrIndices => this.adminSolrIndices = solrIndices)
      .catch(error => this.showApiErrorMsg(error.error));
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
      })
      .catch(error => this.showApiErrorMsg(error.error));
  }

  lookupUsers() {
    console.log('In AdminComponent :: lookupUsers');
    this.userService.listAllUsers()
      .then(users => {
        this.users = users;
      })
      .catch(error => this.showApiErrorMsg(error.error));
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
