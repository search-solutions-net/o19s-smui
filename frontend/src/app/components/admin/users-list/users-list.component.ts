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
import { User } from '../../../models';
import {
  UserService,
  ModalService
} from '../../../services';


@Component({
  selector: 'app-smui-admin-users-list',
  templateUrl: './users-list.component.html'
})
export class UsersListComponent implements OnInit, OnChanges {

  @Input() users: Array<User> = [];

  @Output() openDeleteConfirmModal: EventEmitter<any> = new EventEmitter();
  @Output() showErrorMsg: EventEmitter<string> = new EventEmitter();
  @Output() usersChange: EventEmitter<string> = new EventEmitter();

  constructor(
    private userService: UserService,
  ) {

  }

  ngOnInit() {
    console.log('In UsersListComponent :: ngOnInit');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('In UsersListComponent :: ngOnChanges');
  }


  listAllUsers() {
    console.log('In UsersListComponent :: listAllTeams');
    return this.userService.listAllUsers();
  }

  deleteUser(id: string, event: Event) {
    console.log('In UsersListComponent :: deleteUser');
    event.stopPropagation();
    const deleteCallback = () =>
      this.userService
        .deleteUser(id)
        .then(() => this.listAllUsers().then(users => this.users = users))
        .then(() => this.usersChange.emit(id))
        .catch(error => this.showErrorMsg.emit(error));
    this.openDeleteConfirmModal.emit({ deleteCallback });
  }
}
