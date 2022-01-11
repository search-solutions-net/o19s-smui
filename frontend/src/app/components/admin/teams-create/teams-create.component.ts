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
import {
  TeamService,
  ModalService
} from '../../../services';

@Component({
  selector: 'app-smui-admin-teams-create',
  templateUrl: './teams-create.component.html'
})
export class TeamsCreateComponent implements OnInit, OnChanges {

  //@Output() updateRulesCollectionList: EventEmitter<> = new EventEmitter();
  @Output() showErrorMsg: EventEmitter<string> = new EventEmitter();
  @Output() showSuccessMsg: EventEmitter<string> = new EventEmitter();
  //@Output() refreshRulesCollectionList: EventEmitter<string> = new EventEmitter();
  @Output() teamsChange: EventEmitter<string> = new EventEmitter();

  solrIndices: SolrIndex[];
  name: string;

  constructor(
    private teamService: TeamService,
  ) {

  }
  ngOnInit() {
    console.log('In TeamsCreateComponent :: ngOnInit');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('In TeamsCreateComponent :: ngOnChanges');
  }


  clearForm() {
    this.name = '';
  }

  createTeam( event: Event){
    console.log('In TeamsCreateComponent :: createTeam');
    if (this.name) {
      this.teamService.createTeam(this.name)
        .then(() => this.teamsChange.emit())
        .then(() => this.showSuccessMsg.emit("Created new Team " + this.name))
        .then(() => this.clearForm())
        .catch(error => {
          const apiResult = error.error as ApiResult;
          this.showErrorMsg.emit(apiResult.message);
        });
    }
  }


}
