import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewResultComponent } from '../../controls/view-result/view-result.component';

const routes: Routes = [
  {
    path: '',
    component: ViewResultComponent
  },
  // add route for viewresult with code parameter
  {
    path: 'viewresult?code=:code',
    component: ViewResultComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewResultPageRoutingModule { }
