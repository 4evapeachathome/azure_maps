import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NopeaceathomePageRoutingModule } from './nopeaceathome-routing.module';

import { NopeaceathomePage } from './nopeaceathome.page';
import { HeaderComponent } from "../controls/header/header.component";
import { HomeSliderComponent } from "../controls/home-slider/home-slider.component";
import { HealthyrelatitonshipComponent } from "../controls/healthyrelatitonship/healthyrelatitonship.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NopeaceathomePageRoutingModule,
    HeaderComponent,
    HomeSliderComponent,
    HealthyrelatitonshipComponent
],
  declarations: [NopeaceathomePage]
})
export class NopeaceathomePageModule {}
