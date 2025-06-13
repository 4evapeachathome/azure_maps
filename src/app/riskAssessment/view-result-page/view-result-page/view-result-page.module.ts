import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewResultPageRoutingModule } from './view-result-page-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RiskassessmentFooterComponent } from '../../controls/riskassessment-footer/riskassessment-footer.component';
import { ViewResultPageComponent } from '../view-result-page.component';
import { ViewResultComponent } from '../../controls/view-result/view-result.component';
import { AssessmentTableComponent } from '../../controls/assessment-table/assessment-table.component';
import { QRCodeComponent } from 'angularx-qrcode';
import { SummarypageComponent } from '../../controls/summarypage/summarypage.component';


@NgModule({
  declarations: [
    ViewResultPageComponent,
    ViewResultComponent
  ],
  imports: [
    CommonModule,
    ViewResultPageRoutingModule,
    FormsModule,
    IonicModule,
    RiskassessmentFooterComponent,
    SummarypageComponent,
    AssessmentTableComponent,
    QRCodeComponent
  ]
})
export class ViewResultPageModule { }
