import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HitsAssessmentPagePage } from './hits-assessment-page.page';

const routes: Routes = [
  {
    path: '',
    component: HitsAssessmentPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HitsAssessmentPagePageRoutingModule {}
