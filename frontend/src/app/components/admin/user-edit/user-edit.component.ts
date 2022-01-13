import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import {SolrIndex, Team, User} from '../../../models';
import {
  TeamService,
  UserService,
  SolrService,
  ConfigService,
  ModalService
} from '../../../services';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";

@Component({
  selector: 'app-smui-admin-user-edit',
  templateUrl: './user-edit.component.html'
})
export class UserEditComponent implements OnInit, OnChanges {

  @Output() nameChange: EventEmitter<string> = new EventEmitter();
  @Output() passwordChange: EventEmitter<string> = new EventEmitter();
  @Output() adminChange: EventEmitter<string> = new EventEmitter();
  @Output() passwordChangeRequiredChange: EventEmitter<string> = new EventEmitter();

  user: User;

  name: string;
  password: string;
  admin: boolean;
  passwordChangeRequired: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private configService: ConfigService,
    private toasterService: ToasterService
  ) {

  }

  ngOnInit() {
    console.log('In UserEditComponent :: ngOnInit');
    this.passwordChange.subscribe(() => this.passwordChangeRequired = (this.password.length > 0))
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.userService.listUsers([params.get("userId")!])
        .then(users => {
          const user = users[0];
          this.user = user;
          this.clearForm(true);
        })
        .catch(error => this.showErrorMsg(error));
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.password) {
      console.log(
        'In ReportSettingsBarComponent :: ngOnChanges :: currentSolrIndexId = ' +
        changes.currentSolrIndexId
      );
    }
  }

  public showSuccessMsg(msgText: string) {
    this.toasterService.pop('success', '', msgText);
  }

  public showErrorMsg(msgText: string) {
    this.toasterService.pop('error', '', msgText);
  }

  clearForm(resetFields: boolean) {
    if (resetFields) {
      this.name = this.user.name;
      this.admin = this.user.admin;
      this.passwordChangeRequired = this.user.passwordChangeRequired;
      this.nameChange.emit();
    }
    this.password = '';
  }

  updateUser(){
    console.log('In UserEditComponent :: updateUser');
    if (this.user.name) {
      const newPassword = this.password ? this.password : null;
      this.userService.updateUser(this.user.id, this.name, this.user.email, newPassword, this.admin, this.passwordChangeRequired)
        .then(() => this.showSuccessMsg("Updated user"))
        .catch(error => this.showErrorMsg(error))
        .finally(() => this.clearForm(false));
    }
  }

}
