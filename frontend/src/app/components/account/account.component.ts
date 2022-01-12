import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import {Router} from '@angular/router';

import {ApiResult} from '../../models';
import {ConfigService, FeatureToggleService, UserService} from '../../services';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  @Output() nameChange: EventEmitter<string> = new EventEmitter();
  @Output() passwordChange: EventEmitter<string> = new EventEmitter();
  @Output() password2Change: EventEmitter<string> = new EventEmitter();

  email: string;
  name: string;
  currentName: string;
  password: string;
  password2: string;
  admin: boolean;

  constructor(
    private toasterService: ToasterService,
    public featureToggleService: FeatureToggleService,
    private userService: UserService,
    private configService: ConfigService,
    public router: Router
  ) { }

  ngOnInit(): void {
    console.log('In AccountComponent :: ngOnInit');
    this.email = this.configService.authInfo.currentUser.email;
    this.currentName = this.configService.authInfo.currentUser.name;
    this.admin = this.configService.authInfo.currentUser.admin;
    this.clearForm(true);
  }

  clearForm(resetName: boolean) {
    if (resetName) {
      this.name = this.currentName;
      this.nameChange.emit();
    }
    this.password = '';
    this.password2 = '';
  }

  requestUpdate() {
    console.log('In AccountComponent :: requestUpdate');
    if (this.name) {
      if (this.password && this.password2 && this.password !== this.password2) {
        this.showErrorMsg("Password and confirmation password don't match!")
        this.clearForm(false);
      } else {
        const newPassword = this.password ? this.password : null
        this.userService.updateUser(
          this.configService.authInfo.currentUser.id,
          this.name,
          this.configService.authInfo.currentUser.email,
          newPassword,
          this.configService.authInfo.currentUser.admin
        )
          .then(() => {
            this.configService.getAuthInfo();
            this.showSuccessMsg("Account updated for " + this.email);
            this.currentName = this.name;
            this.clearForm(false);
          })
          .catch(error => {
            const apiResult = error.error as ApiResult;
            this.showErrorMsg(apiResult.message);
            this.clearForm(true);
          });
      }
    } else {
      this.showErrorMsg("Please enter info for all input fields!")
    }
  }

  public showSuccessMsg(msgText: string) {
    this.toasterService.pop('success', '', msgText);
  }

  public showErrorMsg(msgText: string) {
    this.toasterService.pop('error', '', msgText);
  }

}
