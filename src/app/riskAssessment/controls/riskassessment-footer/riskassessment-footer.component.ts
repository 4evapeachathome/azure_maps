import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { IonGrid, IonFooter } from "@ionic/angular/standalone";

@Component({
  selector: 'app-riskassessment-footer',
  templateUrl: './riskassessment-footer.component.html',
  styleUrls: ['./riskassessment-footer.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class RiskassessmentFooterComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
