import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FederallawPage } from './federallaw.page';

const routes: Routes = [
  {
    path: '',
    component: FederallawPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FederallawPageRoutingModule {}
