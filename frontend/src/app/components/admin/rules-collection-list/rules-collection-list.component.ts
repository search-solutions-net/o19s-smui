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
  SolrService,
  ModalService
} from '../../../services';

@Component({
  selector: 'app-smui-admin-rules-collection-list',
  templateUrl: './rules-collection-list.component.html'
})
export class RulesCollectionListComponent implements OnInit, OnChanges {

  @Input() adminSolrIndices: Array<SolrIndex> = [];

  @Output() openDeleteConfirmModal: EventEmitter<any> = new EventEmitter();
  @Output() showErrorMsg: EventEmitter<string> = new EventEmitter();
  @Output() showSuccessMsg: EventEmitter<string> = new EventEmitter();
  @Output() solrIndicesChange: EventEmitter<string> = new EventEmitter();

  constructor(
    private solrService: SolrService,
  ) {

  }
  ngOnInit() {
    console.log('In RulesCollectionListComponent :: ngOnInit');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('In RulesCollectionListComponent :: ngOnChanges');
  }

  deleteRulesCollection(id: string, event: Event) {
    event.stopPropagation();
    const deleteCallback = () =>
      this.solrService
        .deleteSolrIndex(id)
        .then(() => this.solrService.listAllSolrIndices())
        .then(() => this.solrIndicesChange.emit(id))
        .then(() => this.solrService.emitRulesCollectionChangeEvent(""))
        .then(() => this.showSuccessMsg.emit("Rules collection deleted"))
        .catch(error => {
          const apiResult = error.error as ApiResult;
          this.showErrorMsg.emit(apiResult.message);
        });

    this.openDeleteConfirmModal.emit({ deleteCallback })
  }
}
