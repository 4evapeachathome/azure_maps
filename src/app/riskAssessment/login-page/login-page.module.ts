import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPagePageRoutingModule } from './login-page-routing.module';

import { LoginPagePage } from './login-page.page';
import { RiskassessmentFooterComponent } from '../controls/riskassessment-footer/riskassessment-footer.component';
import { LoginPageComponent } from '../controls/login-page/login-page.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RiskassessmentFooterComponent,
    LoginPageComponent,
    LoginPagePageRoutingModule
  ],
  declarations: [LoginPagePage]
})
export class LoginPagePageModule {}
