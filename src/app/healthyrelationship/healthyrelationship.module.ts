import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HealthyrelationshipPageRoutingModule } from './healthyrelationship-routing.module';

import { HealthyrelationshipPage } from './healthyrelationship.page';
import { HeaderComponent } from "../controls/header/header.component";
import { FooterComponent } from "../controls/footer/footer.component";
import { HealthyrelatitonshipComponent } from '../controls/healthyrelatitonship/healthyrelatitonship.component';
import { HealthyrelationshipcontentComponent } from "../controls/healthyrelationshipcontent/healthyrelationshipcontent.component";
import { HomeSliderComponent } from "../controls/home-slider/home-slider.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HealthyrelationshipPageRoutingModule,
    HealthyrelatitonshipComponent,
    HeaderComponent,
    FooterComponent,
    HealthyrelationshipcontentComponent,
    HomeSliderComponent
],
  declarations: [HealthyrelationshipPage]
})
export class HealthyrelationshipPageModule {}
