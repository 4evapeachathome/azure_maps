import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LegalrightsPage } from './legalrights.page';

const routes: Routes = [
  {
    path: '',
    component: LegalrightsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LegalrightsPageRoutingModule {}
