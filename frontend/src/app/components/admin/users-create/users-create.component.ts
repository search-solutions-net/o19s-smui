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
  UserService,
  ModalService
} from '../../../services';

@Component({
  selector: 'app-smui-admin-users-create',
  templateUrl: './users-create.component.html'
})
export class UsersCreateComponent implements OnInit, OnChanges {

  @Output() showErrorMsg: EventEmitter<string> = new EventEmitter();
  @Output() showSuccessMsg: EventEmitter<string> = new EventEmitter();
  @Output() usersChange: EventEmitter<string> = new EventEmitter();

  solrIndices: SolrIndex[];
  name: string;
  email: string;
  password: string;
  admin: boolean;

  constructor(
    private userService: UserService,
  ) {

  }
  ngOnInit() {
    console.log('In UsersCreateComponent :: ngOnInit');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('In UsersCreateComponent :: ngOnChanges');
  }


  clearForm() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.admin = false;
  }

  createUser( event: Event){
    console.log('In UsersCreateComponent :: createUser');
    if (this.admin == null){
      this.admin = false;
    }
    if (this.name && this.email && this.password) {
      this.userService.createUser(this.name, this.email, this.password, this.admin)
        .then(() => this.usersChange.emit())
        .then(() => this.showSuccessMsg.emit("Created new User " + this.email))
        .then(() => this.clearForm())
        .catch(error => {
          const apiResult = error.error as ApiResult;
          this.showErrorMsg.emit(apiResult.message);
        });
    }
  }


}
