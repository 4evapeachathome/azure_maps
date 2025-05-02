import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SripaaPageRoutingModule } from './sripaa-routing.module';

import { SripaaPage } from './sripaa.page';
import { FooterComponent } from "../controls/footer/footer.component";
import { SripacompComponent } from "../controls/sripacomp/sripacomp.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SripaaPageRoutingModule,
    FooterComponent,
    SripacompComponent
],
  declarations: [SripaaPage]
})
export class SripaaPageModule {}
