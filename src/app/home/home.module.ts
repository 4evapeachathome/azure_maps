import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { DailyTipsComponent } from '../controls/daily-tips/daily-tips.component';

import { HomePageRoutingModule } from './home-routing.module';
import { HappyHomeComponent } from '../controls/happy-home/happy-home.component';
import { PeaceHarmonyComponent } from '../controls/peace-harmony/peace-harmony.component';
import { HomeSliderComponent } from '../controls/home-slider/home-slider.component';
import { WellnessTipsComponent } from '../controls/wellness-tips/wellness-tips.component';
import { ContactUsFormComponent } from '../controls/contact-us-form/contact-us-form.component';
import { FooterComponent } from "../controls/footer/footer.component";
import { PeaceathomecardwithimageComponent } from "../controls/peaceathomecardwithimage/peaceathomecardwithimage.component";
import { PeaceathomeComponent } from "../controls/peaceathome/peaceathome.component";
import { HealthyrelatitonshipComponent } from "../controls/healthyrelatitonship/healthyrelatitonship.component";
import { BrowserModule } from '@angular/platform-browser';
import { SupportserviceComponent } from '../controls/supportservice/supportservice.component';
import { ScenarioCardComponent } from "../controls/scenario-card/scenario-card.component";
import { PlainCardComponent } from "../controls/plain-card/plain-card.component";
import { PartnerViolenceProgressbarComponent } from "../controls/partner-violence-progressbar/partner-violence-progressbar.component";
import { PviolencePlaincardListComponent } from "../controls/pviolence-plaincard-list/pviolence-plaincard-list.component";
import { TypesofAbuseCardComponent } from "../controls/typesof-abuse-card/typesof-abuse-card.component";
import { PeaceHomeSliderComponent } from '../controls/peaceat-home-slider/peace-at-homeslide';
import { RelationalComponent } from '../controls/relational/relational.component';
import { HeaderComponent } from "../controls/header/header.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    DailyTipsComponent,
    HappyHomeComponent,
    PeaceHarmonyComponent,
    HomeSliderComponent,
    WellnessTipsComponent,
    PeaceHomeSliderComponent,
    ContactUsFormComponent,
    FooterComponent,
    PeaceathomecardwithimageComponent,
    PeaceathomeComponent,
    HealthyrelatitonshipComponent,
    SupportserviceComponent,
    ScenarioCardComponent,
    PlainCardComponent,
    PartnerViolenceProgressbarComponent,
    PviolencePlaincardListComponent,
    TypesofAbuseCardComponent,
    RelationalComponent,
    HeaderComponent
],
  declarations: [
    HomePage
  ]
})
export class HomePageModule {}
