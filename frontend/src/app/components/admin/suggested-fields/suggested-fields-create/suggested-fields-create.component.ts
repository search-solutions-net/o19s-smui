import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

import { SolrIndex, SuggestedSolrField } from '../../../../models';
import {
  SolrService,
  ModalService
} from '../../../../services';

@Component({
  selector: 'app-smui-admin-suggested-fields-create',
  templateUrl: './suggested-fields-create.component.html'
})
export class SuggestedFieldsCreateComponent implements OnInit, OnChanges {

  //@Output() updateRulesCollectionList: EventEmitter<> = new EventEmitter();
  @Input() solrIndex: SolrIndex;
  @Output() showErrorMsg: EventEmitter<string> = new EventEmitter();
  @Output() showSuccessMsg: EventEmitter<string> = new EventEmitter();
  @Output() suggestedFieldsChange: EventEmitter<string> = new EventEmitter();


  //solrIndex: SolrIndex;
  name: string;
  suggestedFields: SuggestedSolrField[] = [];

  constructor(
    private solrService: SolrService,
  ) {

  }
  ngOnInit() {
    console.log('In SuggestedFieldsCreateComponent :: ngOnInit');

    //this.route.paramMap.subscribe((params: ParamMap) => {
    //  console.log(params);
    //  console.log(params.get("solrIndexId")!.toLowerCase());
      //console.log(this.solrService.getSolrIndex(params.get("id")))
    //  this.solrService.getSolrIndex(params.get("solrIndexId")!.toLowerCase())
    //  .then(solrIndex =>
    //    this.solrIndex = solrIndex
    //  )
    //  .catch(error => this.showErrorMsg.emit(error));
    //})
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('In SuggestedFieldsCreateComponent :: ngOnChanges');
    console.log("DO we have a solrIndex");
    //console.log("solrIndex:" + this.solrIndex.id)
    //if (this.commonService.hasChanged(changes, 'currentSolrIndexId')) {
      //this.refreshItemsInList().catch(error => this.showErrorMsg.emit(error));
    //}
  }


  clearForm() {
    this.name = '';
  }

  createSuggestedField( event: Event){
    console.log('In SuggestedFieldsCreateComponent :: createSuggestedField');
    if (this.name) {
      this.solrService
        .createSuggestedField(this.solrIndex.id, this.name)
        .then(() => this.showSuccessMsg.emit("Created new Suggested Field " + this.name))
        .then(() => this.suggestedFieldsChange.emit())
        .then(() => this.clearForm())
        .catch(error => this.showErrorMsg.emit(error));
    }
  }


}
