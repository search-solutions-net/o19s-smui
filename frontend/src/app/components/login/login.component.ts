import {
  Component,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import {Router} from '@angular/router';

import {ApiResult, SmuiVersionInfo} from '../../models';
import {
  FeatureToggleService,
  UserService,
  ConfigService,
  ModalService
} from '../../services';

@Component({
  selector: 'app-smui-login',
  templateUrl: './login.component.html',
  styleUrls: ['../header-nav/header-nav.component.css']
})
export class LoginComponent implements OnInit {

  @Output() emailChange: EventEmitter<string> = new EventEmitter();
  @Output() passwordChange: EventEmitter<string> = new EventEmitter();
  @Output() signupNameChange: EventEmitter<string> = new EventEmitter();
  @Output() signupEmailChange: EventEmitter<string> = new EventEmitter();
  @Output() signupPasswordChange: EventEmitter<string> = new EventEmitter();
  @Output() signupPassword2Change: EventEmitter<string> = new EventEmitter();
  @Output() changePasswordChange: EventEmitter<string> = new EventEmitter();
  @Output() changePassword2Change: EventEmitter<string> = new EventEmitter();

  versionInfo?: SmuiVersionInfo;
  password: string;
  email: string;
  signupName: string;
  signupEmail: string;
  signupPassword: string;
  signupPassword2: string;
  changePassword: string;
  changePassword2: string;

  constructor(
    private toasterService: ToasterService,
    public featureToggleService: FeatureToggleService,
    private userService: UserService,
    public configService: ConfigService,
    public router: Router,
    public modalService: ModalService
  ) {
  }

  ngOnInit() {
    console.log('In LoginComponent :: ngOnInit');
    this.versionInfo = this.configService.versionInfo;
  }

  clearForm() {
    this.password = '';
    this.signupPassword = '';
    this.signupPassword2 = '';
    this.changePassword = '';
    this.changePassword2 = '';
  }

  public showSuccessMsg(msgText: string) {
    this.toasterService.pop('success', '', msgText);
  }

  public showErrorMsg(msgText: string) {
    this.toasterService.pop('error', '', msgText);
  }

  requestLogin() {
    console.log('In LoginComponent :: requestLogin');
    if (this.email && this.password) {
      this.userService.login(this.email, this.password)
              .then(user => {
                if (user == undefined) {
                  this.showErrorMsg("Invalid email/password combination");
                  this.clearForm();
                } else {
                  this.showSuccessMsg("Logged in as " + this.email);
                  this.configService.getAuthInfo().then(r => {
                      if (this.configService.isLoggedIn()) {
                        window.location.reload();
                      }
                    }
                  )
                }
              })
        .catch(error => this.showErrorMsg(error));
    } else {
      this.showErrorMsg("Please enter both email and password fields!")
    }
  }

  requestSignup() {
    console.log('In LoginComponent :: requestSignup');
    if (this.signupName && this.signupEmail && this.signupPassword && this.signupPassword2) {
      if (this.signupPassword !== this.signupPassword2) {
        this.showErrorMsg("Password and confirmation password don't match!")
        this.clearForm();
      } else {
        this.userService.createUser(this.signupName, this.signupEmail, this.signupPassword, false)
                .then(user => {
                  if (user == undefined) {
                    this.showErrorMsg("Could not signup your user!")
                    this.clearForm();
                  } else {
                    this.showSuccessMsg("Signed up your user profile: " + user.email);
                    this.userService.login(this.signupEmail, this.signupPassword)
                      .then(user => {
                          this.configService.getAuthInfo().then(r => {
                              if (this.configService.isLoggedIn()) {
                                window.location.reload();
                              }
                            }
                          )
                      })
                      .catch(error => this.showErrorMsg(error));
            }
          })
          .catch(error => {
            const apiResult = error.error as ApiResult;
            this.showErrorMsg(apiResult.message);
          });
      }
    } else {
      this.showErrorMsg("Please enter info for all fields!")
    }
  }

  requestPasswordChange() {
    console.log('In LoginComponent :: requestPasswordChange');
    if (this.changePassword && this.changePassword2) {
      if (this.changePassword !== this.changePassword2) {
        this.showErrorMsg("Password and confirmation password don't match!")
        this.clearForm();
      } else {
        this.userService.updateUser(
          this.configService.authInfo.currentUser.id,
          this.configService.authInfo.currentUser.name,
          this.configService.authInfo.currentUser.email,
          this.changePassword,
          this.configService.authInfo.currentUser.admin,
          false
        )
          .then(() => {
            this.showSuccessMsg("Password updated");
            window.location.reload();
          })
          .catch(error => {
            const apiResult = error.error as ApiResult;
            this.showErrorMsg(apiResult.message);
          });
      }
    } else {
      this.showErrorMsg("Please enter info for all fields!")
    }
  }

}
