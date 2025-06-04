import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DaAssessmentRoutingModule } from './da-assessment-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DaAssessmentQuestionsComponent } from '../../controls/da-assessment-questions/da-assessment-questions.component';
import { DaAssessmentPageComponent } from '../da-assessment-page.component';
import { RiskassessmentFooterComponent } from '../../controls/riskassessment-footer/riskassessment-footer.component';


@NgModule({
  declarations: [
    DaAssessmentPageComponent,
    DaAssessmentQuestionsComponent
  ],
  imports: [
    CommonModule,
    DaAssessmentRoutingModule,
    FormsModule,
    IonicModule,
    RiskassessmentFooterComponent
  ]
})
export class DaAssessmentModule { }
