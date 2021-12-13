import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

import { SolrIndex } from '../../../models';
import { Team } from '../../../models';
import {
  TeamService,
  ModalService
} from '../../../services';


@Component({
  selector: 'app-smui-admin-teams-list',
  templateUrl: './teams-list.component.html'
})
export class TeamsListComponent implements OnInit, OnChanges {

  @Input() teams: Array<Team> = [];

  @Output() openDeleteConfirmModal: EventEmitter<any> = new EventEmitter();
  @Output() showErrorMsg: EventEmitter<string> = new EventEmitter();
  @Output() teamsChange: EventEmitter<string> = new EventEmitter();

  constructor(
    private teamService: TeamService,
  ) {

    //this.teams = this.teamService.listAllTeams();
    //this.listAllTeams().then(teams => this.teams = teams);

  }

  //teams: Team[];

  ngOnInit() {
    console.log('In TeamsListComponent :: ngOnInit');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('In TeamsListComponent :: ngOnChanges');
  }


  listAllTeams() {
    console.log('In TeamsListComponent :: listAllTeams');
    return this.teamService.listAllTeams();
          //.then(teams => {
          //  this.teams = teams;
          //});
  }

  deleteTeam(id: string, event: Event) {
    console.log('In TeamsListComponent :: deleteTeam');
    //event.stopPropagation();
    //const deleteCallback = () =>
    //  this.teamService
    //    .deleteTeam(id)
    //    .then(() => this.teamService.refreshTeams())
    //    .catch(error => this.showErrorMsg.emit(error));

    //this.openDeleteConfirmModal.emit({ deleteCallback });
  }
}
