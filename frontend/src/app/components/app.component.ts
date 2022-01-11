import { Component, OnInit } from '@angular/core';
import { ToasterConfig } from 'angular2-toaster';
import { ConfigService, FeatureToggleService, SolrService } from '../services';

const toasterOptions = {
  showCloseButton: false,
  tapToDismiss: true,
  timeout: 5000,
  positionClass: 'toast-bottom-right'
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  toasterConfig: ToasterConfig = new ToasterConfig(toasterOptions);
  isInitialized = false;
  isLoggedIn = false;
  errors: string[] = [];

  constructor(
    private solrService: SolrService,
    private featureToggleService: FeatureToggleService,
    private configService: ConfigService
  ) {
    console.log('In AppComponent :: constructor');
  }

  ngOnInit() {
    console.log('In AppComponent :: ngOnInit');
      Promise.all([
        this.initVersionInfo(),
        this.initFeatureToggles(),
      ]).then(() => {
        this.isInitialized = this.errors.length === 0;
        console.log('In AppComponent :: ngOnInit :: isBackendInitialized = ' + this.isInitialized);
        if (this.isInitialized) {
          Promise.all([
            this.initAuthInfo(),
            this.initSolrIndices()
          ]).then(() => {
            this.isLoggedIn = this.configService.isLoggedIn();
            console.log('In AppComponent :: ngOnInit :: isLoggedIn = ' + this.configService.isLoggedIn() + ' authInfo = ' + this.configService.authInfo?.currentUser.id);
          });
        }
      });

  }

  private initFeatureToggles(): Promise<void> {
    return this.featureToggleService.getFeatureToggles().catch(() => {
      this.errors.push('Could not fetch app configuration from back-end');
    });
  }

  private initSolrIndices(): Promise<void> {
    return this.solrService.refreshSolrIndicesByIds(this.configService.getAuthSolrIndices())
  }

  private initVersionInfo(): Promise<void> {
    return this.configService.getLatestVersionInfo().catch(() => {
      this.errors.push('Could not fetch version info from back-end');
    });
  }

  private initAuthInfo(): Promise<void> {
    return this.configService.getAuthInfo().catch(() => {
      this.errors.push('Could not fetch auth info from back-end');
    });
  }

}
