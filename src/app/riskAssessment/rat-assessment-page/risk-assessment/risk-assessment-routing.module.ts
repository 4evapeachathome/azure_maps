import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RatAssessmentPageComponent } from '../rat-assessment-page.component';

const routes: Routes = [
  {
    path: '',
    component: RatAssessmentPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RiskAssessmentRoutingModule { }
