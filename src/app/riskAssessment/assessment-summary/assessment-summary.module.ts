import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QRCodeComponent } from 'angularx-qrcode';
import { NgxGaugeModule } from 'ngx-gauge';

import { AssessmentSummaryPageRoutingModule } from './assessment-summary-routing.module';
import { AssessmentSummaryPage } from './assessment-summary.page';
import { RiskassessmentFooterComponent } from "../controls/riskassessment-footer/riskassessment-footer.component";
import { AssessmentsummaryComponent } from "../controls/assessmentsummary/assessmentsummary.component";
import { RiskMeterComponent } from '../risk-meter/risk-meter.component';
import { SummarypageComponent } from '../controls/summarypage/summarypage.component';
import { AssessmentTableComponent } from '../controls/assessment-table/assessment-table.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssessmentSummaryPageRoutingModule,
    QRCodeComponent,
    NgxGaugeModule,
    RiskMeterComponent,
    AssessmentsummaryComponent,
    RiskassessmentFooterComponent,
    SummarypageComponent,
    AssessmentTableComponent
  ],
  declarations: [
    AssessmentSummaryPage,
    // AssessmentTableComponent
  ]
})
export class AssessmentSummaryPageModule {}
