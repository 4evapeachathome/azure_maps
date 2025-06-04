import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RiskAssessmentRoutingModule } from './risk-assessment-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HitsassessmentComponent } from '../../controls/hitsassessment/hitsassessment.component';
import { RiskassessmentFooterComponent } from '../../controls/riskassessment-footer/riskassessment-footer.component';
import { RatAssessmentPageComponent } from '../rat-assessment-page.component';
import { RatAssessmentQuestionsComponent } from '../../controls/rat-assessment-questions/rat-assessment-questions.component';


@NgModule({
  declarations: [
    RatAssessmentPageComponent,
    RatAssessmentQuestionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HitsassessmentComponent,
    RiskassessmentFooterComponent,
    IonicModule,
    CommonModule,
    RiskAssessmentRoutingModule
  ]
})
export class RiskAssessmentModule { }
