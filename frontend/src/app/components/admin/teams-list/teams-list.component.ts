import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

import {ApiResult, SolrIndex} from '../../../models';
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

  @Input() teams: Team[];
  @Input() adminSolrIndices: SolrIndex[];

  @Output() openDeleteConfirmModal: EventEmitter<any> = new EventEmitter();
  @Output() showSuccessMsg: EventEmitter<string> = new EventEmitter();
  @Output() showErrorMsg: EventEmitter<string> = new EventEmitter();
  @Output() teamsChange: EventEmitter<string> = new EventEmitter();

  constructor(
    private teamService: TeamService,
  ) {}

  ngOnInit() {
    console.log('In TeamsListComponent :: ngOnInit');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('In TeamsListComponent :: ngOnChanges');
  }

  listAllTeams() {
    console.log('In TeamsListComponent :: listAllTeams');
    return this.teamService.listAllTeams();
  }

  deleteTeam(id: string, event: Event) {
    console.log('In TeamsListComponent :: deleteTeam');
    event.stopPropagation();
    const deleteCallback = () =>
      this.teamService
        .deleteTeam(id)
        .then(() => this.listAllTeams().then(teams => this.teams = teams))
        .then(() => this.teamsChange.emit(id))
        .then(() => this.showSuccessMsg.emit('Team deleted'))
        .catch(error => {
          const apiResult = error.error as ApiResult;
          this.showErrorMsg.emit(apiResult.message);
        });

    this.openDeleteConfirmModal.emit({ deleteCallback });
  }

}
