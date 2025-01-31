import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { DailyTipsComponent } from '../controls/daily-tips/daily-tips.component';

import { HomePageRoutingModule } from './home-routing.module';
import { HappyHomeComponent } from '../controls/happy-home/happy-home.component';
import { PeaceHarmonyComponent } from '../controls/peace-harmony/peace-harmony.component';
import { PeaceHomeSliderComponent } from '../controls/peace-home-slider/peace-home-slider.component';
import { WellnessTipsComponent } from '../controls/wellness-tips/wellness-tips.component';
import { ContactUsFormComponent } from '../controls/contact-us-form/contact-us-form.component';
import { FooterComponent } from "../controls/footer/footer.component";
import { PeaceathomecardComponent } from "../controls/peaceathomecard/peaceathomecard.component";
import { PeacehomestrengthenpowersComponent } from "../controls/peacehomestrengthenpowers/peacehomestrengthenpowers.component";
import { PeaceathomecardwithimageComponent } from "../controls/peaceathomecardwithimage/peaceathomecardwithimage.component";
import { PeaceathomeComponent } from "../controls/peaceathome/peaceathome.component";
import { HealthyrelatitonshipComponent } from "../controls/healthyrelatitonship/healthyrelatitonship.component";
import { BrowserModule } from '@angular/platform-browser';
import { SupportserviceComponent } from '../controls/supportservice/supportservice.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    DailyTipsComponent,
    HappyHomeComponent,
    PeaceHarmonyComponent,
    PeaceHomeSliderComponent,
    WellnessTipsComponent,
    ContactUsFormComponent,
    FooterComponent,
    PeaceathomecardComponent,
    PeacehomestrengthenpowersComponent,
    PeaceathomecardwithimageComponent,
    PeaceathomeComponent,
    HealthyrelatitonshipComponent,
    SupportserviceComponent
],
  declarations: [
    HomePage
  ]
})
export class HomePageModule {}
