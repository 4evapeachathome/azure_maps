import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SupportservicePageRoutingModule } from './supportservice-routing.module';

import { SupportservicePage } from './supportservice.page';
import { ContactUsFormComponent } from "../controls/contact-us-form/contact-us-form.component";
import { FooterComponent } from "../controls/footer/footer.component";
import { HeaderComponent } from "../controls/header/header.component";
import { SupportserviceComponent } from "../controls/supportservice/supportservice.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SupportservicePageRoutingModule,
    ContactUsFormComponent,
    FooterComponent,
    HeaderComponent,
    SupportserviceComponent
],
  declarations: [SupportservicePage]
})
export class SupportservicePageModule {}
