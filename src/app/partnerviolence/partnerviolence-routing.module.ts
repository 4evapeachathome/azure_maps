import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PartnerviolencePage } from './partnerviolence.page';

const routes: Routes = [
  {
    path: '',
    component: PartnerviolencePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartnerviolencePageRoutingModule {}
