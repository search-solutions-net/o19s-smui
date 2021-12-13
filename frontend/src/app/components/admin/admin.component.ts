import {Component, OnInit, Input, SimpleChanges} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { SolrIndex, Team } from '../../models';

import {
  SolrService,
  ModalService,
  TeamService
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
    private teamService: TeamService
  ) {

  }

  solrIndices: SolrIndex[];
  teams: Team[];

  ngOnInit() {
    console.log('In AdminComponent :: ngOnInit');
    this.solrIndices = this.solrService.solrIndices;
    this.lookupTeams();
    //this.teamService.listAllTeams()
     // .then(teams => this.teams = teams);
    //this.teamService.listAllTeams()
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('In AdminComponent :: ngOnChanges');
    this.lookupTeams();
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
    //this.teams = this.teamService.listAllTeams();
    this.teamService.listAllTeams().then(teams => this.teams = teams);
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

}
