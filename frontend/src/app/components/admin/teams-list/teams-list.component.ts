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

  @Input() teams: Team[];
  @Input() solrIndices: SolrIndex[];

  @Output() openDeleteConfirmModal: EventEmitter<any> = new EventEmitter();
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
        .catch(error => this.showErrorMsg.emit(error));

    this.openDeleteConfirmModal.emit({ deleteCallback });
  }

}
