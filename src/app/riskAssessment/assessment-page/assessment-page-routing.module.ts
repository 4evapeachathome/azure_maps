import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssessmentPagePage } from './assessment-page.page';

const routes: Routes = [
  {
    path: '',
    component: AssessmentPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssessmentPagePageRoutingModule {}
