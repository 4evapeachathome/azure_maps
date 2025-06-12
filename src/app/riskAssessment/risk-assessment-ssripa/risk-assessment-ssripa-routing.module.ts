import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RiskAssessmentSSripaPage } from './risk-assessment-ssripa.page';

const routes: Routes = [
  {
    path: '',
    component: RiskAssessmentSSripaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RiskAssessmentSSripaPageRoutingModule {}
