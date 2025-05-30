import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssessmentResultPageRoutingModule } from './user-creation-routing.module';

import { UserCreationPage } from './user-creation.page';
import { RiskassessmentFooterComponent } from "../controls/riskassessment-footer/riskassessment-footer.component";
import { UserCreationComponent } from "../controls/usercreation/usercreation.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssessmentResultPageRoutingModule,
    RiskassessmentFooterComponent,
    UserCreationComponent
],
  declarations: [UserCreationPage]
})
export class AssessmentResultPageModule {}
