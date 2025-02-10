import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HealthyrelationshipPageRoutingModule } from './healthyrelationship-routing.module';

import { HealthyrelationshipPage } from './healthyrelationship.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HealthyrelationshipPageRoutingModule
  ],
  declarations: [HealthyrelationshipPage]
})
export class HealthyrelationshipPageModule {}
