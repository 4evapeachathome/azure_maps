import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DaAssessmentPageComponent } from '../da-assessment-page.component';

const routes: Routes = [
  {
    path: '',
    component: DaAssessmentPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DaAssessmentRoutingModule { }
