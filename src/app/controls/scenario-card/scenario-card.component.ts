import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'pathome-scenario-card',
  templateUrl: './scenario-card.component.html',
  styleUrls: ['./scenario-card.component.scss'],
     standalone: true,
      imports: [CommonModule, IonicModule]
})
export class ScenarioCardComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
