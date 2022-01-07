import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchManagementComponent } from './components/search-management';
import { ReportComponent } from './components/report';
import { AdminComponent } from './components/admin';
import { AccountComponent } from './components/account';
import { SuggestedFieldsComponent } from './components/admin/suggested-fields';
import { TeamsEditComponent } from './components/admin';

const routes: Routes = [
  { path: '', redirectTo: 'rules', pathMatch: 'full' },
  { path: 'rules', component: SearchManagementComponent },
  { path: 'report', component: ReportComponent },
  { path: 'account', component: AccountComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'admin/suggested-fields/:solrIndexId', component: SuggestedFieldsComponent },
  { path: 'admin/teams/:teamId', component: TeamsEditComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {useHash: true})
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
