import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuizPageRoutingModule } from './quiz-routing.module';

import { QuizPage } from './quiz.page';
import { FooterComponent } from "../controls/footer/footer.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuizPageRoutingModule,
    FooterComponent
],
  declarations: [QuizPage]
})
export class QuizPageModule {}
