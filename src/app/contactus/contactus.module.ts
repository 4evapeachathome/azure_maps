import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactusPageRoutingModule } from './contactus-routing.module';

import { ContactusPage } from './contactus.page';
import { HeaderComponent } from "../controls/header/header.component";
import { FooterComponent } from "../controls/footer/footer.component";
import { ContactUsFormComponent } from "../controls/contact-us-form/contact-us-form.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactusPageRoutingModule,
    HeaderComponent,
    FooterComponent,
    ContactUsFormComponent
],
  declarations: [ContactusPage]
})
export class ContactusPageModule {}
