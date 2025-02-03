import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'pathome-plain-card',
  templateUrl: './plain-card.component.html',
  styleUrls: ['./plain-card.component.scss'],
   standalone: true,
      imports: [CommonModule, IonicModule]
})
export class PlainCardComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
