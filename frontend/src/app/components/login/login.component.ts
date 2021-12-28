import {Component, OnInit} from '@angular/core';
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
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  versionInfo?: SmuiVersionInfo;
  password: string;
  email: string;
  signup_name: string;
  signup_email: string;
  signup_password: string;
  signup_password2: string;

  constructor(
    private toasterService: ToasterService,
    public featureToggleService: FeatureToggleService,
    private userService: UserService,
    private configService: ConfigService,
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
    this.signup_password = '';
    this.signup_password2 = '';
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
                  this.showSuccessMsg("Logged in as " + user.email);
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
    if (this.signup_name && this.signup_email && this.signup_password && this.signup_password2) {
      if (this.signup_password !== this.signup_password2) {
        this.showErrorMsg("Password and confirmation password don't match!")
        this.clearForm();
      } else {
        this.userService.createUser(this.signup_name, this.signup_email, this.signup_password, false)
                .then(user => {
                  if (user == undefined) {
                    this.showErrorMsg("Could not signup your user!")
                    this.clearForm();
                  } else {
                    this.showSuccessMsg("Signed up your user profile: " + user.email);
                    this.userService.login(this.signup_email, this.signup_password)
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

}
